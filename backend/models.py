from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    phone = Column(String, nullable=True)

    settings = relationship("UserSettings", back_populates="user", uselist=False)


class UserSettings(Base):
    __tablename__ = "user_settings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    
    dangerous_spikes = Column(Boolean, default=True)
    anomaly_alerts = Column(Boolean, default=True)
    forecasting_alerts = Column(Boolean, default=True)
    pattern_alerts = Column(Boolean, default=True)
    cost_optimization_alerts = Column(Boolean, default=True)
    
    language = Column(String, default="English")
    dark_mode = Column(Boolean, default=False)
    monthly_budget = Column(Float, default=3500.0)

    user = relationship("User", back_populates="settings")


class ConsumptionData(Base):
    __tablename__ = "consumption_data"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, index=True)
    consumption_kwh = Column(Float)
    
    # Appliance states
    ac_active = Column(Integer, default=0)
    heater_active = Column(Integer, default=0)
    tv_active = Column(Integer, default=0)
    washing_machine_active = Column(Integer, default=0)
    fan_active = Column(Integer, default=0)
    fridge_active = Column(Integer, default=1)
