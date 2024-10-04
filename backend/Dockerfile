
# use python version 3.11
FROM python:3

# Set enviorment vars to avoid buffer and bytecode issues
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# copy requirements into the app
COPY ./requirements.txt /app/


RUN pip install -r app/requirements.txt


# Copy contents into app
COPY . /app/

# Set working dir into app
WORKDIR /app

# expose port 8000
EXPOSE 8000

#RUN DJANGO SERVER
CMD ["python","manage.py","runserver","0.0.0.0:8000"]
