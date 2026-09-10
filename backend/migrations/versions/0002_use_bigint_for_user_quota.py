"""use bigint for user quota bytes

Revision ID: 0002_use_bigint_for_user_quota
Revises: 0001_initial_schema
"""

from alembic import op
import sqlalchemy as sa


revision = "0002_use_bigint_for_user_quota"
down_revision = "0001_initial_schema"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.alter_column(
        "users",
        "quota_bytes",
        existing_type=sa.Integer(),
        type_=sa.BigInteger(),
        existing_nullable=False,
    )


def downgrade() -> None:
    op.alter_column(
        "users",
        "quota_bytes",
        existing_type=sa.BigInteger(),
        type_=sa.Integer(),
        existing_nullable=False,
    )
