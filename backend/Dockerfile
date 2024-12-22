FROM python:3.12-slim


WORKDIR /app

COPY requirements.txt ./

# Use a different base image
RUN pip install -r requirements.txt

COPY . .
CMD ["sh", "-c", "python manage.py migrate && python manage.py runserver 0.0.0.0:8080"]
