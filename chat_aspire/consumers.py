import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Message
from django.contrib.auth import get_user_model
from app_fyp.models import Internship
from django.conf import settings
from datetime import datetime

logger = logging.getLogger(__name__)

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        try:
            self.internship_id = self.scope['url_route']['kwargs']['internship_id']
            self.room_group_name = f'chat_{self.internship_id}'
            
            # Verify internship exists
            internship = await self.get_internship()
            if not internship:
                await self.close(code=4004, reason="Internship not found")
                return

            # Verify user is authenticated
            if not self.scope["user"].is_authenticated:
                await self.close(code=4003, reason="Authentication required")
                return

            # Add to room group
            await self.channel_layer.group_add(self.room_group_name, self.channel_name)
            await self.accept()

            # Send connection confirmation
            await self.send(text_data=json.dumps({
                'type': 'connection_established',
                'content': 'Connected to chat successfully',
                'sender': 'System',
                'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M')
            }))

            # Load previous messages
            await self.load_previous_messages()

            logger.info(f"WebSocket connected for internship {self.internship_id}, user: {self.scope['user'].username}")
        except Exception as e:
            logger.error(f"Error in connect: {str(e)}")
            await self.close(code=4000, reason=str(e))

    async def disconnect(self, close_code):
        try:
            logger.info(f"WebSocket disconnected for internship {self.internship_id}, code: {close_code}")
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
        except Exception as e:
            logger.error(f"Error in disconnect: {str(e)}")

    async def receive(self, text_data):
        try:
            text_data_json = json.loads(text_data)
            content = text_data_json.get('content', '').strip()
            
            if not content:
                await self.send(text_data=json.dumps({
                    'type': 'error',
                    'content': 'Message cannot be empty',
                    'sender': 'System',
                    'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M')
                }))
                return

            sender = self.scope['user']
            if not sender.is_authenticated:
                await self.send(text_data=json.dumps({
                    'type': 'error',
                    'content': 'Please log in to send messages',
                    'sender': 'System',
                    'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M')
                }))
                return

            # Save message to database
            message = await self.save_message(sender, content)
            
            # Send message to room group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'content': content,
                    'sender': sender.username,
                    'timestamp': message.timestamp.strftime('%Y-%m-%d %H:%M'),
                    'message_id': message.id
                }
            )

            logger.info(f"Message sent successfully - ID: {message.id}, Sender: {sender.username}")
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'content': 'Invalid message format',
                'sender': 'System',
                'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M')
            }))
        except Exception as e:
            logger.error(f"Error in receive: {str(e)}")
            await self.send(text_data=json.dumps({
                'type': 'error',
                'content': f"Error: {str(e)}",
                'sender': 'System',
                'timestamp': datetime.now().strftime('%Y-%m-%d %H:%M')
            }))

    async def chat_message(self, event):
        try:
            await self.send(text_data=json.dumps({
                'type': 'chat_message',
                'content': event['content'],
                'sender': event['sender'],
                'timestamp': event['timestamp'],
                'message_id': event.get('message_id')
            }))
        except Exception as e:
            logger.error(f"Error in chat_message: {str(e)}")

    @database_sync_to_async
    def get_internship(self):
        try:
            return Internship.objects.using('default').get(id=self.internship_id)
        except Internship.DoesNotExist:
            return None

    @database_sync_to_async
    def save_message(self, sender, content):
        try:
            internship = Internship.objects.using('default').get(id=self.internship_id)
            User = get_user_model()
            
            # Get receiver (staff user or sender if no staff user)
            receiver = User.objects.using('user_auth').filter(is_staff=True).first()
            if not receiver:
                logger.warning("No staff user found, using sender as receiver")
                receiver = sender

            # Save message to the default database
            message = Message.objects.using('default').create(
                sender_id=sender.id,
                receiver_id=receiver.id,
                internship_id=internship.id,
                content=content
            )
            return message
        except Exception as e:
            logger.error(f"Error saving message: {str(e)}")
            raise

    async def load_previous_messages(self):
        try:
            messages = await self.get_previous_messages()
            for message in messages:
                await self.send(text_data=json.dumps({
                    'type': 'chat_message',
                    'content': message.content,
                    'sender': message.sender.username,
                    'timestamp': message.timestamp.strftime('%Y-%m-%d %H:%M'),
                    'message_id': message.id
                }))
        except Exception as e:
            logger.error(f"Error loading previous messages: {str(e)}")

    @database_sync_to_async
    def get_previous_messages(self):
        try:
            return Message.objects.using('default').filter(
                internship_id=self.internship_id
            ).order_by('timestamp')[:50]  # Load last 50 messages
        except Exception as e:
            logger.error(f"Error getting previous messages: {str(e)}")
            return []