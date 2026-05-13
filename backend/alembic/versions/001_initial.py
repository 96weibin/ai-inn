"""initial migration

Revision ID: 001_initial
Revises:
Create Date: 2024-01-15

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = '001_initial'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    op.create_table(
        'rooms',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('room_number', sa.String(10), nullable=False),
        sa.Column('floor', sa.Integer(), nullable=False),
        sa.Column('type', sa.String(20), nullable=False),
        sa.Column('status', sa.String(20), nullable=False),
        sa.Column('price', sa.Float(), nullable=False),
        sa.Column('max_guests', sa.Integer(), nullable=True),
        sa.Column('has_window', sa.Boolean(), nullable=True),
        sa.Column('amenities', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('GETDATE()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('GETDATE()'), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('room_number')
    )
    op.create_index('ix_rooms_room_number', 'rooms', ['room_number'], unique=True)

    op.create_table(
        'guests',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('name', sa.String(50), nullable=False),
        sa.Column('phone', sa.String(20), nullable=False),
        sa.Column('id_card', sa.String(20), nullable=False),
        sa.Column('email', sa.String(100), nullable=True),
        sa.Column('preferences', sa.Text(), nullable=True),
        sa.Column('total_stays', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('GETDATE()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('GETDATE()'), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('phone'),
        sa.UniqueConstraint('id_card')
    )
    op.create_index('ix_guests_name', 'guests', ['name'], unique=False)
    op.create_index('ix_guests_phone', 'guests', ['phone'], unique=True)

    op.create_table(
        'bookings',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('room_id', sa.Integer(), nullable=False),
        sa.Column('guest_id', sa.Integer(), nullable=False),
        sa.Column('check_in', sa.Date(), nullable=False),
        sa.Column('check_out', sa.Date(), nullable=False),
        sa.Column('guests', sa.Integer(), nullable=True),
        sa.Column('status', sa.String(20), nullable=False),
        sa.Column('platform', sa.String(50), nullable=True),
        sa.Column('price', sa.Float(), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('GETDATE()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('GETDATE()'), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['room_id'], ['rooms.id'], ),
        sa.ForeignKeyConstraint(['guest_id'], ['guests.id'], )
    )

    op.create_table(
        'platforms',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('name', sa.String(50), nullable=False),
        sa.Column('api_key', sa.String(255), nullable=True),
        sa.Column('active', sa.Boolean(), nullable=True),
        sa.Column('sync_enabled', sa.Boolean(), nullable=True),
        sa.Column('last_sync', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('GETDATE()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('GETDATE()'), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )
    op.create_index('ix_platforms_name', 'platforms', ['name'], unique=True)

    op.create_table(
        'ai_conversations',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('user_message', sa.Text(), nullable=False),
        sa.Column('ai_response', sa.Text(), nullable=False),
        sa.Column('intent', sa.String(50), nullable=True),
        sa.Column('entities', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('GETDATE()'), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )

    op.create_table(
        'system_settings',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('key', sa.String(50), nullable=False),
        sa.Column('value', sa.Text(), nullable=True),
        sa.Column('description', sa.String(255), nullable=True),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('GETDATE()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('GETDATE()'), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('key')
    )

def downgrade() -> None:
    op.drop_table('system_settings')
    op.drop_table('ai_conversations')
    op.drop_table('platforms')
    op.drop_table('bookings')
    op.drop_table('guests')
    op.drop_table('rooms')
