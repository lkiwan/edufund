import os
import sys
import random
from datetime import datetime, timedelta

from dotenv import load_dotenv

# Ensure backend package is importable
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app import create_app, _db as db
from backend.models import (
    User,
    Campaign,
    CampaignMetrics,
    Donation,
    CampaignUpdate,
    CampaignComment,
    Favorite,
    Image,
)

load_dotenv()
app = create_app()

roles = ["student", "donor", "admin"]
categories = ["Education", "Scholarship", "Tuition", "Books", "Housing"]
cities = ["Paris", "Lyon", "Marseille", "Toulouse", "Nice"]
universities = [
    "Sorbonne", "Polytechnique", "Grenoble Alpes", "Lyon 1", "Marseille Aix", "Toulouse INP",
]
fields = ["Computer Science", "Medicine", "Economics", "Law", "Engineering", "Arts"]

first_names = ["Alice", "Bob", "Charlie", "Diana", "Eve", "Frank", "Grace", "Hank", "Ivy", "Jack"]
last_names = ["Martin", "Bernard", "Dubois", "Thomas", "Robert", "Richard", "Petit", "Durand", "Leroy", "Moreau"]


def rand_name():
    return f"{random.choice(first_names)} {random.choice(last_names)}"


def rand_email(i):
    return f"user{i}_{random.randint(1000,9999)}@example.com"


def seed_random_users_and_campaigns(count=20, max_campaigns_per_user=3):
    with app.app_context():
        import bcrypt

        users = []
        for i in range(count):
            pwd_hash = bcrypt.hashpw("password".encode(), bcrypt.gensalt()).decode()
            u = User(
                email=rand_email(i),
                password_hash=pwd_hash,
                role=random.choice(roles),
            )
            db.session.add(u)
            users.append(u)
        db.session.commit()

        # Optional profile images for users
        for u in users:
            if random.random() < 0.5:
                db.session.add(
                    Image(url="/assets/images/Untitled.png", alt="User Avatar", user_id=u.id)
                )
        db.session.commit()

        # Create campaigns per user
        all_campaigns = []
        for u in users:
            for _ in range(random.randint(0, max_campaigns_per_user)):
                goal = random.randint(2000, 15000)
                current = random.randint(0, goal)
                c = Campaign(
                    user_id=u.id,
                    title=f"{random.choice(['Help', 'Support', 'Fund'])} {rand_name()} Studies",
                    description="Help fund education for a promising student.",
                    goal_amount=goal,
                    current_amount=current,
                    category=random.choice(categories),
                    city=random.choice(cities),
                    university=random.choice(universities),
                    cover_image="/assets/images/Untitled.png",
                    status=random.choice(["active", "paused", "completed"]),
                    created_at=datetime.utcnow() - timedelta(days=random.randint(0, 180)),
                    end_date=datetime.utcnow() + timedelta(days=random.randint(15, 120)),
                    featured=random.random() < 0.2,
                    student_name=rand_name(),
                    student_avatar="/assets/images/Untitled.png",
                    student_university=random.choice(universities),
                    student_field=random.choice(fields),
                    student_year=random.choice(["Freshman", "Sophomore", "Junior", "Senior"]),
                )
                db.session.add(c)
                db.session.commit()
                all_campaigns.append(c)

                # Campaign images
                db.session.add(Image(url="/assets/images/Untitled.png", alt="Cover", campaign_id=c.id))

                # Metrics
                db.session.add(
                    CampaignMetrics(
                        campaign_id=c.id,
                        views=random.randint(50, 5000),
                        shares=random.randint(5, 500),
                        updates=random.randint(0, 10),
                    )
                )

                # Donations (1-3)
                for _ in range(random.randint(1, 3)):
                    donor_name = rand_name()
                    donor_email = f"{donor_name.lower().replace(' ', '.')}@mail.com"
                    amount = random.randint(10, 300)
                    db.session.add(
                        Donation(
                            campaign_id=c.id,
                            amount=amount,
                            donor_name=donor_name,
                            donor_email=donor_email,
                        )
                    )

                # Updates (0-2)
                for _ in range(random.randint(0, 2)):
                    db.session.add(
                        CampaignUpdate(
                            campaign_id=c.id,
                            title=random.choice(["Kickoff", "Progress", "Milestone"]),
                            content="Thanks for your support!",
                        )
                    )

                # Comments (0-3)
                for _ in range(random.randint(0, 3)):
                    commenter = random.choice(users)
                    db.session.add(
                        CampaignComment(
                            campaign_id=c.id,
                            user_id=commenter.id,
                            comment=random.choice([
                                "Great initiative!",
                                "Happy to help.",
                                "Wishing you success!",
                                "Keep going!",
                            ]),
                        )
                    )

                db.session.commit()

        # Favorites: random links between users and campaigns (avoid duplicates)
        existing_pairs = set()
        for _ in range(min(100, len(users) * max(1, len(all_campaigns)))):
            u = random.choice(users)
            c = random.choice(all_campaigns) if all_campaigns else None
            if not c:
                break
            pair = (u.id, c.id)
            if pair in existing_pairs:
                continue
            existing_pairs.add(pair)
            db.session.add(Favorite(user_id=u.id, campaign_id=c.id))
        db.session.commit()

        print("Random seeding completed.")
        print(
            {
                "users": User.query.count(),
                "campaigns": Campaign.query.count(),
                "donations": Donation.query.count(),
                "comments": CampaignComment.query.count(),
                "updates": CampaignUpdate.query.count(),
                "favorites": Favorite.query.count(),
            }
        )


if __name__ == "__main__":
    seed_random_users_and_campaigns()