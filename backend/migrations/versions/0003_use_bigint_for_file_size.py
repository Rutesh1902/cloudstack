"""use bigint for file size

Revision ID: 0003_use_bigint_for_file_size
Revises: 0002_use_bigint_for_user_quota
"""

from alembic import op
import sqlalchemy as sa


revision = "0003_use_bigint_for_file_size"
down_revision = "0002_use_bigint_for_user_quota"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.alter_column(
        "nodes",
        "size",
        existing_type=sa.Integer(),
        type_=sa.BigInteger(),
        existing_nullable=True,
    )


def downgrade() -> None:
    op.alter_column(
        "nodes",
        "size",
        existing_type=sa.BigInteger(),
        type_=sa.Integer(),
        existing_nullable=True,
    )
