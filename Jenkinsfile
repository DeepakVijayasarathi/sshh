pipeline {
    agent any

    environment {
        IMAGE_SERVER = "sourashtra-server"
        IMAGE_CLIENT = "sourashtra-client"
        CONTAINER_SERVER = "sourashtra-server-app"
        CONTAINER_CLIENT = "sourashtra-client-app"
        APP_PORT_HTTP  = "80"
        APP_PORT_API   = "5000"
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
                withCredentials([file(credentialsId: 'sourashtra-env', variable: 'ENV_FILE')]) {
                    sh """
                        docker volume create sourashtra-uploads || true

                        docker run -d \
                            --name ${CONTAINER_SERVER} \
                            --restart unless-stopped \
                            --env-file \$ENV_FILE \
                            -e NODE_ENV=production \
                            -e CLIENT_URL=http://localhost \
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
        }

        stage('Smoke Test') {
            steps {
                sh """
                    sleep 5
                    curl -sf http://localhost:${APP_PORT_API}/api/health || \
                        (echo "Server health check failed"; exit 1)
                    curl -sf http://localhost:${APP_PORT_HTTP}/ || \
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

                docker run -d \
                    --name ${CONTAINER_SERVER} \
                    --restart unless-stopped \
                    -p ${APP_PORT_API}:5000 \
                    -v sourashtra-uploads:/app/uploads \
                    ${IMAGE_SERVER}:\$PREV 2>/dev/null || echo "No previous server image"

                docker run -d \
                    --name ${CONTAINER_CLIENT} \
                    --restart unless-stopped \
                    --link ${CONTAINER_SERVER}:server \
                    -p ${APP_PORT_HTTP}:80 \
                    ${IMAGE_CLIENT}:\$PREV 2>/dev/null || echo "No previous client image"
            """
        }
        always {
            sh "docker system prune -f --filter 'until=24h' || true"
        }
    }
}
