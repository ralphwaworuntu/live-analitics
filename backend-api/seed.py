import asyncio
import argparse
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy import select

from app.config import settings
from app.models import Personnel, Polres
from app.services.auth_service import get_password_hash

async def seed_db(nrp: str, password: str):
    print(f"Connecting to database: {settings.DATABASE_URL}")
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async_session = async_sessionmaker(engine, expire_on_commit=False)

    try:
        async with async_session() as session:
            # First create a dummy Polres if none exist
            result = await session.execute(select(Polres).limit(1))
            polres = result.scalars().first()

            if not polres:
                print("Creating dummy Polres (Polres Kupang Kota)...")
                polres = Polres(
                    name="Polres Kupang Kota",
                    code="kupang-kota",
                    island="Timor",
                )
                session.add(polres)
                await session.commit()
                await session.refresh(polres)
            
            # Create Personnel
            result = await session.execute(select(Personnel).where(Personnel.nrp == nrp))
            personnel = result.scalars().first()

            if personnel:
                print(f"User with NRP {nrp} already exists. Updating password...")
                personnel.password_hash = get_password_hash(password)
                personnel.role = "superadmin"
                personnel.login_attempts = 0
                personnel.locked_until = None
            else:
                print(f"Creating new superadmin with NRP {nrp}...")
                personnel = Personnel(
                    nrp=nrp,
                    name="Test Superadmin",
                    rank="AKBP",
                    position="Kasubbag Renops",
                    polres_id=polres.id,
                    password_hash=get_password_hash(password),
                    role="superadmin"
                )
                session.add(personnel)
            
            await session.commit()
            print(f"✅ Success! You can now login with NRP: {nrp} and password: {password}")

    except Exception as e:
        print(f"❌ Error during seed: {e}")
    finally:
        await engine.dispose()

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed the Sentinel DB with a test user.")
    parser.add_argument("--nrp", type=str, default="84020111", help="NRP (Username) for login")
    parser.add_argument("--password", type=str, default="tactical123", help="Password for login")
    
    args = parser.parse_args()
    asyncio.run(seed_db(args.nrp, args.password))
