FROM evoapicloud/evolution-api:latest

# Criar script que roda sem database
RUN echo '#!/bin/bash' > /start.sh && \
    echo 'export DATABASE_ENABLED=false' >> /start.sh && \
    echo 'export EVOLUTION_DATABASE_ENABLED=false' >> /start.sh && \
    echo 'exec npm run start:prod' >> /start.sh && \
    chmod +x /start.sh

ENTRYPOINT ["/start.sh"]
