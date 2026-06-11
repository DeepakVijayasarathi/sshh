pipeline {
    agent any

    environment {
        IMAGE_SERVER     = "sourashtra-server"
        IMAGE_CLIENT     = "sourashtra-client"
        CONTAINER_SERVER = "sourashtra-server-app"
        CONTAINER_CLIENT = "sourashtra-client-app"
        APP_PORT_HTTP    = "8000"
        APP_PORT_API     = "8001"
        DB_PORT          = "5432"
        DB_NAME          = "newsite"

        // Secrets pulled from Jenkins Credentials Store — never hardcoded here.
        // Add these in Jenkins → Manage Jenkins → Credentials → Global:
        //   ID: sourashtra-db-host      Kind: Secret text   Value: 5.223.64.206
        //   ID: sourashtra-db-user      Kind: Secret text   Value: admin
        //   ID: sourashtra-db-password  Kind: Secret text   Value: <db password>
        //   ID: sourashtra-jwt-secret   Kind: Secret text   Value: <jwt secret>
        DB_HOST     = credentials('sourashtra-db-host')
        DB_USER     = credentials('sourashtra-db-user')
        DB_PASSWORD = credentials('sourashtra-db-password')
        JWT_SECRET  = credentials('sourashtra-jwt-secret')
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/DeepakVijayasarathi/sshh.git'
            }
        }

        stage('Build Server Image') {
            steps {
                sh "docker build -t ${IMAGE_SERVER}:${BUILD_NUMBER} -t ${IMAGE_SERVER}:latest ./server"
            }
        }

        stage('Build Client Image') {
            steps {
                sh "docker build -t ${IMAGE_CLIENT}:${BUILD_NUMBER} -t ${IMAGE_CLIENT}:latest ./client"
            }
        }

        stage('Stop Old Containers') {
            steps {
                sh """
                    docker stop ${CONTAINER_SERVER} ${CONTAINER_CLIENT} || true
                    docker rm   ${CONTAINER_SERVER} ${CONTAINER_CLIENT} || true
                """
            }
        }

        stage('Deploy') {
            steps {
                sh """
                    docker volume create sourashtra-uploads || true

                    docker run -d \
                        --name ${CONTAINER_SERVER} \
                        --restart unless-stopped \
                        -e NODE_ENV=production \
                        -e CLIENT_URL=http://localhost \
                        -e DB_HOST=${DB_HOST} \
                        -e DB_PORT=${DB_PORT} \
                        -e DB_NAME=${DB_NAME} \
                        -e DB_USER=${DB_USER} \
                        -e DB_PASSWORD=${DB_PASSWORD} \
                        -e JWT_SECRET=${JWT_SECRET} \
                        -p ${APP_PORT_API}:5000 \
                        -v sourashtra-uploads:/app/uploads \
                        --health-cmd 'wget -qO- http://localhost:5000/api/health || exit 1' \
                        --health-interval 30s \
                        --health-timeout 10s \
                        --health-retries 3 \
                        ${IMAGE_SERVER}:${BUILD_NUMBER}

                    echo "Waiting for server to become healthy..."
                    for i in \$(seq 1 20); do
                        STATUS=\$(docker inspect --format='{{.State.Health.Status}}' ${CONTAINER_SERVER} 2>/dev/null)
                        if [ "\$STATUS" = "healthy" ]; then break; fi
                        echo "  attempt \$i: \$STATUS"
                        sleep 5
                    done

                    docker run -d \
                        --name ${CONTAINER_CLIENT} \
                        --restart unless-stopped \
                        --link ${CONTAINER_SERVER}:server \
                        -p ${APP_PORT_HTTP}:80 \
                        ${IMAGE_CLIENT}:${BUILD_NUMBER}
                """
            }
        }

        stage('Smoke Test') {
            steps {
                sh """
                    sleep 5
                    API_IP=\$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' ${CONTAINER_SERVER})
                    WEB_IP=\$(docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' ${CONTAINER_CLIENT})
                    echo "Server IP: \$API_IP  Client IP: \$WEB_IP"
                    curl -sf http://\$API_IP:5000/api/health || \
                        (echo "Server health check failed"; exit 1)
                    curl -sf http://\$WEB_IP:80/ || \
                        (echo "Client health check failed"; exit 1)
                    echo "Smoke tests passed"
                """
            }
        }

        stage('Prune Old Images') {
            steps {
                sh """
                    docker images ${IMAGE_SERVER} --format '{{.Tag}}' | \
                        grep -v latest | grep -v ${BUILD_NUMBER} | \
                        xargs -r -I{} docker rmi ${IMAGE_SERVER}:{} || true

                    docker images ${IMAGE_CLIENT} --format '{{.Tag}}' | \
                        grep -v latest | grep -v ${BUILD_NUMBER} | \
                        xargs -r -I{} docker rmi ${IMAGE_CLIENT}:{} || true
                """
            }
        }
    }

    post {
        success {
            echo "Deployment successful — build #${BUILD_NUMBER}"
            echo "App running at http://localhost"
        }
        failure {
            echo "Build #${BUILD_NUMBER} failed — rolling back to previous containers"
            sh """
                docker stop ${CONTAINER_SERVER} ${CONTAINER_CLIENT} || true
                docker rm   ${CONTAINER_SERVER} ${CONTAINER_CLIENT} || true

                PREV=\$(expr ${BUILD_NUMBER} - 1)

                if [ "\$PREV" -gt 0 ]; then
                    docker run -d \
                        --name ${CONTAINER_SERVER} \
                        --restart unless-stopped \
                        -e DB_HOST=${DB_HOST} \
                        -e DB_PORT=${DB_PORT} \
                        -e DB_NAME=${DB_NAME} \
                        -e DB_USER=${DB_USER} \
                        -e DB_PASSWORD=${DB_PASSWORD} \
                        -e JWT_SECRET=${JWT_SECRET} \
                        -p ${APP_PORT_API}:5000 \
                        -v sourashtra-uploads:/app/uploads \
                        ${IMAGE_SERVER}:\$PREV 2>/dev/null || echo "No previous server image to roll back to"

                    docker run -d \
                        --name ${CONTAINER_CLIENT} \
                        --restart unless-stopped \
                        --link ${CONTAINER_SERVER}:server \
                        -p ${APP_PORT_HTTP}:80 \
                        ${IMAGE_CLIENT}:\$PREV 2>/dev/null || echo "No previous client image to roll back to"
                else
                    echo "Build #1 failed — no previous image to roll back to"
                fi
            """
        }
        always {
            sh "docker system prune -f --filter 'until=24h' || true"
        }
    }
}
