import logging
from pythonjsonlogger import jsonlogger
from asgi_correlation_id import correlation_id
from datetime import datetime
import sys

class CustomJsonFormatter(jsonlogger.JsonFormatter):
    def add_fields(self, log_record, record, message_dict):
        super(CustomJsonFormatter, self).add_fields(log_record, record, message_dict)
        
        # Enforce standard fields
        if not log_record.get('timestamp'):
            log_record['timestamp'] = datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%S.%fZ')
        if log_record.get('level'):
            log_record['level'] = log_record['level'].upper()
        else:
            log_record['level'] = record.levelname
            
        # Extract ASGI correlation/request ID if within a FastAPI request context
        req_id = correlation_id.get()
        if req_id:
            log_record['request_id'] = req_id

def setup_logging():
    logger = logging.getLogger()
    # Intercept default logging config and shift to Info level
    logger.setLevel(logging.INFO)

    # Clean existing unformatted handlers
    for handler in logger.handlers[:]:
        logger.removeHandler(handler)

    # Initialize structured JSON format
    formatter = CustomJsonFormatter(
        '%(timestamp)s %(level)s %(name)s %(message)s'
    )

    # Export to Docker captured stdout
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    
    # Redirect Uvicorn webserver logs through our JSON format
    for logger_name in ["uvicorn", "uvicorn.error", "uvicorn.access"]:
        u_logger = logging.getLogger(logger_name)
        u_logger.handlers = []
        u_logger.addHandler(handler)
        u_logger.propagate = False
