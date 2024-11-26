FROM joyzoursky/python-chromedriver:3.8
WORKDIR /parser
COPY requirements.txt /parser
RUN pip install -r requirements.txt
COPY . /parser
CMD ["python", "main.py"]