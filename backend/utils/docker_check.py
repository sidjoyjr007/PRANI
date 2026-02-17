
import logging
import docker
from docker.errors import DockerException

logger = logging.getLogger(__name__)

def check_docker_availability():
    try:
        client = docker.from_env()
        client.ping()
        logger.info("Docker is available and running.")
        return True
    except DockerException as e:
        logger.error(f"Docker is NOT available: {e}")
        return False
    except Exception as e:
        logger.error(f"Error checking Docker: {e}")
        return False
