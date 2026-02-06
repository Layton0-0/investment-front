// CI: build, test, Docker image build (정적 빌드 → Nginx/CDN 서빙), registry push.
pipeline {
    agent any
    stages {
        stage('Build') {
            steps {
                sh 'npm ci'
                sh 'npm run build'
            }
        }
        stage('Test') {
            steps {
                sh 'npm run test -- --run'
            }
        }
        stage('Docker Build') {
            steps {
                script {
                    def tag = env.GIT_COMMIT?.take(7) ?: 'latest'
                    sh "docker build -t investment-frontend:${tag} ."
                }
            }
        }
    }
}
