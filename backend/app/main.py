from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from .core.config import settings
from .core.database import engine, Base
from .routers import auth, users, teachings, courses, retreats, events, products, payments, email, admin, forms, blog
from .routers import static_pages, static_content, online_retreats, faq, form_templates


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan events for startup and shutdown."""
    # Create database tables
    Base.metadata.create_all(bind=engine)
    yield
    # Cleanup if needed


# Initialize FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    debug=settings.DEBUG,
    lifespan=lifespan,
)

# Configure CORS - Use dynamic origins for Vercel deployment support
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.get_allowed_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(teachings.router, prefix="/api/teachings", tags=["Teachings"])
app.include_router(courses.router, prefix="/api/courses", tags=["Courses"])
app.include_router(retreats.router, prefix="/api/retreats", tags=["Retreats"])
app.include_router(events.router, prefix="/api/events", tags=["Events"])
app.include_router(products.router, prefix="/api/products", tags=["Products & Store"])
app.include_router(payments.router, prefix="/api/payments", tags=["Payments"])
app.include_router(email.router, prefix="/api/email", tags=["Email Marketing"])
app.include_router(forms.router, prefix="/api/forms", tags=["Forms"])
app.include_router(form_templates.router, prefix="/api/form-templates", tags=["Form Templates"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])
app.include_router(blog.router, prefix="/api/blog", tags=["Blog"])

# Static Content APIs
app.include_router(static_pages.router, prefix="/api/pages", tags=["Static Pages"])
app.include_router(faq.router, prefix="/api", tags=["FAQs"])
app.include_router(static_content.contact_router, prefix="/api", tags=["Contact"])
app.include_router(static_content.membership_router, prefix="/api", tags=["Membership"])
app.include_router(static_content.donations_router, prefix="/api", tags=["Donations"])
app.include_router(online_retreats.router, prefix="/api/online-retreats", tags=["Online Retreats"])


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Sat Yoga API",
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}
