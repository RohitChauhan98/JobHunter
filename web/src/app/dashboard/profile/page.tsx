'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { profile as profileApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// ─── Skills Suggestion Database ─────────────────────────────────────────────

const SKILL_SUGGESTIONS: Record<string, string[]> = {
    technical: [
        // Languages
        'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'C', 'Go', 'Golang', 'Rust',
        'Ruby', 'PHP', 'Swift', 'Kotlin', 'Scala', 'R', 'Dart', 'Lua', 'Perl', 'Haskell',
        'Elixir', 'Clojure', 'F#', 'OCaml', 'Erlang', 'Julia', 'MATLAB', 'Objective-C',
        'Visual Basic', 'VB.NET', 'Assembly', 'COBOL', 'Fortran', 'Ada', 'Scheme', 'Racket',
        'Common Lisp', 'Groovy', 'Crystal', 'Nim', 'Zig', 'V', 'D', 'Solidity', 'Move',
        'WebAssembly', 'WASM', 'SQL', 'PL/SQL', 'T-SQL', 'Shell', 'PowerShell', 'Bash',
        'Zsh', 'Fish', 'CoffeeScript', 'ReasonML', 'Reason', 'PureScript', 'Elm',
        'ActionScript', 'Apex', 'ABAP', 'Scratch', 'Logo', 'Prolog', 'Tcl',

        // Frontend Frameworks & Libraries
        'React', 'React.js', 'ReactJS', 'Next.js', 'Next', 'Nextjs', 'Vue.js', 'Vue', 'Vuejs',
        'Nuxt.js', 'Nuxt', 'Nuxtjs', 'Angular', 'AngularJS', 'Angular.js', 'Svelte',
        'SvelteKit', 'Solid.js', 'SolidJS', 'Preact', 'Inferno', 'Lit', 'LitElement',
        'Stencil', 'Qwik', 'Astro', 'Remix', 'Gatsby', 'Eleventy', '11ty', 'Gridsome',
        'VuePress', 'Docusaurus', 'Alpine.js', 'Alpine', 'htmx', 'HTMX', 'Hotwire',
        'Turbo', 'Stimulus', 'Marko', 'Ember.js', 'Ember', 'Backbone.js', 'Backbone',
        'Knockout.js', 'Knockout', 'Meteor', 'Blaze', 'Polymer', 'Web Components',

        // HTML/CSS/Styling
        'HTML5', 'HTML', 'CSS3', 'CSS', 'Sass', 'SCSS', 'LESS', 'Stylus', 'PostCSS',
        'Tailwind CSS', 'Tailwind', 'TailwindCSS', 'Bootstrap', 'Material UI', 'MUI',
        'Chakra UI', 'Ant Design', 'Antd', 'Semantic UI', 'Bulma', 'Foundation',
        'Styled Components', 'styled-components', 'Emotion', 'CSS Modules', 'CSS-in-JS',
        'Vanilla Extract', 'Stitches', 'Panda CSS', 'UnoCSS', 'WindiCSS', 'Tachyons',
        'Materialize', 'PrimeReact', 'PrimeVue', 'PrimeNG', 'Radix UI', 'shadcn/ui',
        'Headless UI', 'Mantine', 'NextUI', 'DaisyUI', 'Flowbite',

        // Animation & Graphics
        'Framer Motion', 'Framer', 'Three.js', 'ThreeJS', 'D3.js', 'D3', 'WebGL',
        'Canvas API', 'SVG', 'GSAP', 'GreenSock', 'Anime.js', 'Lottie', 'Rive',
        'PixiJS', 'Pixi.js', 'Babylon.js', 'Babylonjs', 'P5.js', 'Processing',
        'Paper.js', 'Fabric.js', 'Konva.js', 'Two.js', 'Matter.js', 'Cannon.js',
        'Rapier', 'React Spring', 'Motion One', 'AutoAnimate', 'Zdog',

        // Backend Frameworks
        'Node.js', 'Node', 'NodeJS', 'Express.js', 'Express', 'Fastify', 'Koa', 'Koa.js',
        'NestJS', 'Nest.js', 'Nest', 'Hono', 'Elysia', 'Bun', 'Deno', 'Django',
        'Flask', 'FastAPI', 'Tornado', 'Pyramid', 'Bottle', 'CherryPy', 'Sanic',
        'Starlette', 'Quart', 'Spring Boot', 'Spring', 'Spring Framework', 'Micronaut',
        'Quarkus', 'Vert.x', 'Play Framework', 'Dropwizard', 'Spark Java',
        'Rails', 'Ruby on Rails', 'Sinatra', 'Hanami', 'Laravel', 'Symfony', 'CodeIgniter',
        'Yii', 'Phalcon', 'Slim', 'Lumen', 'CakePHP', 'Zend', 'Laminas',
        'ASP.NET', 'ASP.NET Core', '.NET', '.NET Core', 'Blazor', 'Nancy',
        'Gin', 'Echo', 'Fiber', 'Chi', 'Beego', 'Revel', 'Buffalo',
        'Actix', 'Actix-web', 'Rocket', 'Axum', 'Warp', 'Tokio', 'async-std',
        'Phoenix', 'Phoenix Framework', 'Plug', 'Cowboy', 'Ecto',
        'Vapor', 'Kitura', 'Perfect', 'Ktor', 'http4k', 'Javalin',

        // Databases - SQL
        'PostgreSQL', 'Postgres', 'MySQL', 'MariaDB', 'SQLite', 'Microsoft SQL Server',
        'SQL Server', 'MSSQL', 'Oracle Database', 'Oracle DB', 'DB2', 'SAP HANA',
        'CockroachDB', 'YugabyteDB', 'TiDB', 'Vitess', 'Percona', 'Amazon Aurora',
        'Google Cloud SQL', 'Azure SQL', 'PlanetScale', 'NeonDB', 'Neon', 'Supabase',
        'Xata', 'Railway', 'Tembo', 'CrunchyData',

        // Databases - NoSQL
        'MongoDB', 'Mongo', 'Mongoose', 'Redis', 'Cassandra', 'ScyllaDB', 'DynamoDB',
        'Couchbase', 'CouchDB', 'RavenDB', 'ArangoDB', 'OrientDB', 'Neo4j', 'Neptune',
        'Dgraph', 'JanusGraph', 'TigerGraph', 'Memcached', 'Hazelcast', 'Apache Ignite',
        'RethinkDB', 'FaunaDB', 'Fauna', 'Firebase Realtime Database', 'Firestore',
        'Azure Cosmos DB', 'Cosmos DB', 'DocumentDB', 'Cloud Firestore',

        // Search & Analytics Databases
        'Elasticsearch', 'ElasticSearch', 'OpenSearch', 'Solr', 'Apache Solr',
        'Algolia', 'Meilisearch', 'Typesense', 'Quickwit', 'Sonic', 'Bleve',
        'ClickHouse', 'Druid', 'Apache Druid', 'Pinot', 'Apache Pinot',
        'TimescaleDB', 'InfluxDB', 'Prometheus', 'Graphite', 'Victoria Metrics',

        // Vector Databases
        'Pinecone', 'Weaviate', 'Milvus', 'Qdrant', 'Chroma', 'ChromaDB',
        'pgvector', 'Vespa', 'Marqo', 'LanceDB', 'Vald',

        // ORMs & Query Builders
        'Prisma', 'Drizzle', 'Drizzle ORM', 'Sequelize', 'TypeORM', 'MikroORM',
        'Knex', 'Knex.js', 'Bookshelf', 'Objection.js', 'Waterline', 'Lucid',
        'SQLAlchemy', 'Peewee', 'Tortoise ORM', 'Pony ORM', 'Django ORM',
        'Hibernate', 'MyBatis', 'jOOQ', 'JDBI', 'Exposed', 'Diesel',
        'SeaORM', 'SQLx', 'Active Record', 'Eloquent', 'Doctrine', 'Propel',
        'Entity Framework', 'EF Core', 'Dapper', 'NHibernate', 'GORM',

        // Cloud Platforms
        'AWS', 'Amazon Web Services', 'Google Cloud', 'GCP', 'Google Cloud Platform',
        'Azure', 'Microsoft Azure', 'DigitalOcean', 'Linode', 'Vultr', 'Hetzner',
        'Oracle Cloud', 'OCI', 'IBM Cloud', 'Alibaba Cloud', 'Aliyun', 'Tencent Cloud',
        'Cloudflare', 'Cloudflare Workers', 'Fastly', 'Akamai', 'Heroku', 'Render',
        'Fly.io', 'Railway', 'Vercel', 'Netlify', 'AWS Amplify', 'Amplify',
        'Firebase', 'Firebase Hosting', 'GitHub Pages', 'GitLab Pages', 'Surge',
        'Fleek', 'Spheron', 'Akash', '4everland',

        // AWS Services
        'EC2', 'S3', 'Lambda', 'ECS', 'EKS', 'RDS', 'DynamoDB', 'CloudFront',
        'Route 53', 'API Gateway', 'CloudWatch', 'CloudFormation', 'SNS', 'SQS',
        'Step Functions', 'EventBridge', 'Kinesis', 'Athena', 'Glue', 'EMR',
        'Redshift', 'Aurora', 'ElastiCache', 'Elastic Beanstalk', 'Lightsail',
        'AppSync', 'Cognito', 'IAM', 'Secrets Manager', 'Parameter Store', 'KMS',
        'WAF', 'Shield', 'GuardDuty', 'Inspector', 'Macie', 'VPC', 'ELB', 'ALB',
        'NLB', 'Auto Scaling', 'Fargate', 'App Runner', 'Copilot', 'SAM',
        'CDK', 'AWS CDK', 'CodeBuild', 'CodeDeploy', 'CodePipeline', 'CodeCommit',

        // GCP Services
        'Compute Engine', 'Cloud Run', 'Cloud Functions', 'GKE', 'App Engine',
        'Cloud Storage', 'BigQuery', 'Cloud SQL', 'Cloud Spanner', 'Firestore',
        'Bigtable', 'Memorystore', 'Cloud CDN', 'Cloud DNS', 'Cloud Load Balancing',
        'Cloud Armor', 'Pub/Sub', 'Cloud Tasks', 'Cloud Scheduler', 'Workflows',
        'Dataflow', 'Dataproc', 'Vertex AI', 'Cloud Vision', 'Cloud Natural Language',

        // Azure Services
        'Azure Virtual Machines', 'Azure Functions', 'Azure App Service', 'AKS',
        'Azure Container Instances', 'Azure Blob Storage', 'Azure SQL Database',
        'Cosmos DB', 'Azure Cache for Redis', 'Azure DevOps', 'Azure Pipelines',
        'Azure Boards', 'Azure Repos', 'Azure Artifacts', 'Azure Monitor',
        'Application Insights', 'Azure Service Bus', 'Event Hubs', 'Event Grid',

        // DevOps & CI/CD
        'Docker', 'Kubernetes', 'K8s', 'Helm', 'Kustomize', 'Skaffold', 'Tilt',
        'Podman', 'Buildah', 'containerd', 'CRI-O', 'Docker Compose', 'Docker Swarm',
        'Rancher', 'OpenShift', 'Nomad', 'Consul', 'Vault', 'Terraform', 'OpenTofu',
        'Pulumi', 'CloudFormation', 'ARM Templates', 'Bicep', 'Ansible', 'Chef',
        'Puppet', 'SaltStack', 'CI/CD', 'GitHub Actions', 'GitLab CI', 'GitLab CI/CD',
        'Jenkins', 'CircleCI', 'Travis CI', 'Bamboo', 'TeamCity', 'Azure DevOps',
        'Drone', 'Buildkite', 'Concourse', 'Argo CD', 'ArgoCD', 'Flux', 'FluxCD',
        'Spinnaker', 'Harness', 'Tekton', 'Jenkins X', 'CodeShip', 'Buddy',
        'Semaphore', 'Wercker', 'Bitrise', 'Codemagic', 'Fastlane',

        // Monitoring & Observability
        'Prometheus', 'Grafana', 'Datadog', 'New Relic', 'Dynatrace', 'AppDynamics',
        'Splunk', 'ELK Stack', 'Elasticsearch Logstash Kibana', 'Kibana', 'Logstash',
        'Fluentd', 'Fluent Bit', 'Loki', 'Tempo', 'Jaeger', 'Zipkin', 'OpenTelemetry',
        'OTEL', 'Sentry', 'Rollbar', 'Bugsnag', 'Honeycomb', 'Lightstep', 'SignalFx',
        'CloudWatch', 'Azure Monitor', 'Google Cloud Monitoring', 'Stackdriver',
        'PagerDuty', 'Opsgenie', 'VictorOps', 'Better Stack', 'Uptime Robot',
        'Pingdom', 'StatusCake', 'Checkly', 'Highlight.io', 'LogRocket',

        // Web Servers & Proxies
        'Nginx', 'Apache', 'Apache HTTP Server', 'HAProxy', 'Traefik', 'Envoy',
        'Caddy', 'Caddy Server', 'IIS', 'Lighttpd', 'Tomcat', 'Jetty', 'Undertow',
        'Gunicorn', 'uWSGI', 'Uvicorn', 'Hypercorn', 'Daphne', 'Puma', 'Unicorn',
        'Passenger', 'Thin', 'WEBrick', 'Mongrel', 'Istio', 'Linkerd', 'Consul Connect',

        // Message Queues & Streaming
        'RabbitMQ', 'Rabbit MQ', 'Apache Kafka', 'Kafka', 'Redis Pub/Sub', 'NATS',
        'NATS Streaming', 'Apache Pulsar', 'Pulsar', 'Amazon SQS', 'Amazon SNS',
        'Google Pub/Sub', 'Azure Service Bus', 'Azure Event Hubs', 'ZeroMQ', '0MQ',
        'ActiveMQ', 'IBM MQ', 'RocketMQ', 'NSQ', 'Beanstalkd', 'IronMQ', 'Celery',
        'Bull', 'BullMQ', 'Bee Queue', 'Kue', 'Agenda', 'Sidekiq', 'Resque',
        'Delayed Job', 'Apache Flink', 'Flink', 'Apache Spark', 'Spark', 'Storm',
        'Apache Storm', 'Samza', 'Apache Samza', 'Beam', 'Apache Beam',

        // API Technologies
        'REST API', 'REST', 'RESTful', 'GraphQL', 'Apollo', 'Apollo Server',
        'Apollo Client', 'Apollo Federation', 'Relay', 'URQL', 'gRPC', 'Protobuf',
        'Protocol Buffers', 'WebSockets', 'Socket.io', 'Socket.IO', 'ws', 'uWebSockets',
        'tRPC', 'JSON-RPC', 'XML-RPC', 'SOAP', 'OpenAPI', 'Swagger', 'Postman',
        'Insomnia', 'Hoppscotch', 'Thunder Client', 'Paw', 'HTTPie', 'cURL',
        'Axios', 'Fetch API', 'SuperAgent', 'Got', 'node-fetch', 'ky', 'wretch',
        'SWR', 'React Query', 'TanStack Query', 'RTK Query', 'Apollo Client',

        // Authentication & Security
        'OAuth', 'OAuth 2.0', 'OpenID Connect', 'OIDC', 'SAML', 'JWT', 'JSON Web Token',
        'Passport.js', 'Passport', 'Auth0', 'Okta', 'AWS Cognito', 'Firebase Auth',
        'Supabase Auth', 'Clerk', 'NextAuth.js', 'NextAuth', 'Lucia', 'Better Auth',
        'Keycloak', 'FusionAuth', 'Ory', 'Authelia', 'Authentik', 'LDAP',
        'Active Directory', 'Kerberos', 'bcrypt', 'Argon2', 'scrypt', 'PBKDF2',
        'SSL', 'TLS', 'HTTPS', 'Let\'s Encrypt', 'Certbot', 'mTLS', 'CORS',
        'CSP', 'Content Security Policy', 'OWASP', 'Helmet.js', 'express-rate-limit',

        // Mobile Development
        'React Native', 'Flutter', 'iOS Development', 'Android Development', 'Expo',
        'SwiftUI', 'UIKit', 'Jetpack Compose', 'Android Jetpack', 'Capacitor',
        'Ionic', 'Cordova', 'PhoneGap', 'NativeScript', 'Xamarin', 'Kotlin Multiplatform',
        'KMM', '.NET MAUI', 'Tauri', 'Electron', 'NW.js', 'Neutralinojs',
        'Xcode', 'Android Studio', 'Fastlane', 'TestFlight', 'Firebase',
        'Firebase Cloud Messaging', 'FCM', 'Apple Push Notification', 'APNs',
        'RevenueCat', 'OneSignal', 'Pusher', 'Ably', 'PubNub',

        // AI/ML Frameworks
        'Machine Learning', 'ML', 'Deep Learning', 'DL', 'TensorFlow', 'PyTorch',
        'Keras', 'scikit-learn', 'sklearn', 'JAX', 'Flax', 'MXNet', 'Caffe',
        'Theano', 'Chainer', 'PaddlePaddle', 'XGBoost', 'LightGBM', 'CatBoost',
        'H2O.ai', 'MLflow', 'Kubeflow', 'Ray', 'Horovod', 'ONNX', 'CoreML',
        'TensorFlow Lite', 'TensorFlow.js', 'PyTorch Mobile', 'OpenVINO',

        // AI/ML - NLP & LLMs
        'Natural Language Processing', 'NLP', 'Large Language Models', 'LLM',
        'Transformers', 'Hugging Face', 'HuggingFace', 'LangChain', 'LlamaIndex',
        'Semantic Kernel', 'Haystack', 'LiteLLM', 'OpenAI API', 'GPT', 'Claude API',
        'Anthropic API', 'Gemini', 'Gemini API', 'Cohere', 'AI21', 'Mistral AI',
        'spaCy', 'NLTK', 'Gensim', 'FastText', 'Word2Vec', 'BERT', 'RoBERTa',
        'T5', 'GPT-2', 'GPT-3', 'GPT-4', 'LLaMA', 'Falcon', 'Mistral', 'Mixtral',
        'Ollama', 'LocalAI', 'vLLM', 'TGI', 'Text Generation Inference',

        // AI/ML - Computer Vision
        'Computer Vision', 'CV', 'OpenCV', 'YOLO', 'YOLOv5', 'YOLOv8', 'Ultralytics',
        'Detectron2', 'MMDetection', 'MediaPipe', 'CLIP', 'SAM', 'Segment Anything',
        'Stable Diffusion', 'ControlNet', 'DALL-E', 'Midjourney', 'ResNet', 'VGG',
        'Inception', 'EfficientNet', 'Vision Transformer', 'ViT', 'Pillow', 'PIL',
        'scikit-image', 'SimpleCV', 'Kornia', 'Albumentations', 'imgaug',

        // Data Science & Analytics
        'Pandas', 'NumPy', 'SciPy', 'Matplotlib', 'Seaborn', 'Plotly', 'Bokeh',
        'Altair', 'Dash', 'Streamlit', 'Gradio', 'Jupyter', 'JupyterLab', 'IPython',
        'Google Colab', 'Kaggle', 'Observable', 'Apache Airflow', 'Airflow', 'Dagster',
        'Prefect', 'Luigi', 'dbt', 'Great Expectations', 'Kedro', 'Metaflow',
        'Apache Spark', 'PySpark', 'Dask', 'Vaex', 'Polars', 'Modin', 'cuDF',
        'Rapids', 'Apache Arrow', 'Parquet', 'Avro', 'ORC', 'Feather',

        // Testing Frameworks
        'Jest', 'Vitest', 'Cypress', 'Playwright', 'Selenium', 'WebDriver',
        'Testing Library', 'React Testing Library', 'Vue Testing Library',
        'Mocha', 'Chai', 'Jasmine', 'Karma', 'AVA', 'Tape', 'QUnit', 'Sinon',
        'pytest', 'unittest', 'nose', 'Robot Framework', 'Behave', 'Lettuce',
        'JUnit', 'TestNG', 'Mockito', 'JMock', 'Spock', 'Cucumber', 'SpecFlow',
        'NUnit', 'xUnit', 'MSTest', 'RSpec', 'Minitest', 'Capybara', 'PHPUnit',
        'Pest', 'Behat', 'Codeception', 'Puppeteer', 'Nightwatch', 'Protractor',
        'Appium', 'Detox', 'XCTest', 'XCUITest', 'Espresso', 'UIAutomator',
        'TestCafe', 'Webdriverio', 'Gauge', 'k6', 'Gatling', 'JMeter', 'Locust',
        'Artillery', 'Vegeta', 'wrk', 'ab', 'Siege', 'Storybook', 'Chromatic',

        // Build Tools & Bundlers
        'Webpack', 'Vite', 'Rollup', 'esbuild', 'Parcel', 'Snowpack', 'Turbopack',
        'Rspack', 'SWC', 'Babel', 'TypeScript Compiler', 'tsc', 'Bun', 'Rome', 'Biome',
        'Gulp', 'Grunt', 'Broccoli', 'Browserify', 'RequireJS', 'SystemJS',
        'Metro', 'Bazel', 'Buck', 'Pants', 'Lerna', 'Nx', 'Turborepo', 'Rush',
        'pnpm', 'npm', 'Yarn', 'Yarn Berry', 'Bun Package Manager', 'Cargo',
        'pip', 'Poetry', 'Pipenv', 'conda', 'Maven', 'Gradle', 'Ant', 'sbt',
        'RubyGems', 'Bundler', 'Composer', 'NuGet', 'CocoaPods', 'Swift Package Manager',
        'SPM', 'Carthage', 'Go Modules', 'dep', 'Mix', 'Hex', 'Pub', 'Crates.io',

        // Version Control
        'Git', 'GitHub', 'GitLab', 'Bitbucket', 'Azure Repos', 'Gitea', 'Gogs',
        'Mercurial', 'SVN', 'Subversion', 'Perforce', 'CVS', 'Bazaar', 'Fossil',
        'Pijul', 'Darcs', 'Git LFS', 'GitHub Actions', 'GitHub Copilot', 'GitHub CLI',
        'GitLab Runner', 'Dependabot', 'Renovate', 'Snyk', 'Trivy', 'Grype',
        'SonarQube', 'SonarCloud', 'CodeClimate', 'Codacy', 'ESLint', 'Prettier',
        'Stylelint', 'TSLint', 'Pylint', 'Black', 'Flake8', 'mypy', 'Ruff',
        'Rubocop', 'StandardRB', 'PHP CS Fixer', 'PHPStan', 'Psalm', 'Checkstyle',
        'PMD', 'SpotBugs', 'ktlint', 'detekt', 'SwiftLint', 'golangci-lint',
        'Clippy', 'rustfmt', 'cargo fmt', 'cargo clippy',

        // IDEs & Editors
        'VS Code', 'Visual Studio Code', 'Visual Studio', 'IntelliJ IDEA', 'WebStorm',
        'PyCharm', 'PhpStorm', 'GoLand', 'RubyMine', 'CLion', 'Rider', 'DataGrip',
        'Android Studio', 'Xcode', 'Eclipse', 'NetBeans', 'Sublime Text', 'Atom',
        'Vim', 'Neovim', 'Emacs', 'Spacemacs', 'Doom Emacs', 'Nano', 'Notepad++',
        'Brackets', 'Cursor', 'Zed', 'Nova', 'CodeSandbox', 'StackBlitz', 'Replit',
        'Glitch', 'CodePen', 'JSFiddle', 'JSBin', 'Plunker',

        // Design & Prototyping
        'Figma', 'Sketch', 'Adobe XD', 'InVision', 'Framer', 'Principle', 'ProtoPie',
        'Marvel', 'Axure', 'Balsamiq', 'Miro', 'FigJam', 'Whimsical', 'Lucidchart',
        'Draw.io', 'Excalidraw', 'tldraw', 'Penpot', 'Lunacy', 'Avocode', 'Zeplin',
        'Abstract', 'Photoshop', 'Illustrator', 'After Effects', 'Premiere Pro',
        'Blender', 'Cinema 4D', 'Maya', 'Unity', 'Unreal Engine', 'Godot',

        // CMS & E-commerce
        'WordPress', 'Drupal', 'Joomla', 'Contentful', 'Sanity', 'Strapi',
        'Ghost', 'Directus', 'KeystoneJS', 'Payload CMS', 'Tina CMS', 'Builder.io',
        'Prismic', 'Storyblok', 'DatoCMS', 'Hygraph', 'GraphCMS', 'Butter CMS',
        'Netlify CMS', 'Decap CMS', 'Forestry', 'Shopify', 'WooCommerce',
        'Magento', 'PrestaShop', 'BigCommerce', 'Salesforce Commerce Cloud',
        'Medusa', 'Saleor', 'Vendure', 'Sylius', 'Spree', 'Solidus',
        'Reaction Commerce', 'Snipcart', 'Commerce.js', 'Stripe', 'PayPal',
        'Square', 'Braintree', 'Adyen', 'Mollie', 'Razorpay', 'Paddle',

        // Analytics & Tracking
        'Google Analytics', 'GA4', 'Mixpanel', 'Amplitude', 'Segment', 'Heap',
        'Plausible', 'Umami', 'Matomo', 'Piwik', 'Fathom', 'Simple Analytics',
        'PostHog', 'FullStory', 'Hotjar', 'Crazy Egg', 'Mouseflow', 'Lucky Orange',
        'Google Tag Manager', 'GTM', 'Tealium', 'Adobe Analytics', 'Rudderstack',
        'Snowplow', 'mParticle', 'Customer.io', 'Intercom', 'Zendesk', 'Freshdesk',

        // Email & Communication
        'SendGrid', 'Mailgun', 'Postmark', 'AWS SES', 'Amazon SES', 'Resend',
        'Brevo', 'Sendinblue', 'Mailchimp', 'Campaign Monitor', 'ConvertKit',
        'ActiveCampaign', 'Mailjet', 'SparkPost', 'Mandrill', 'Nodemailer',
        'MJML', 'React Email', 'Maizzle', 'Twilio', 'Vonage', 'Nexmo', 'MessageBird',
        'Plivo', 'Bandwidth', 'Slack API', 'Discord.js', 'Telegram Bot API',
        'WhatsApp Business API', 'Microsoft Teams', 'Zoom SDK',

        // Blockchain & Web3
        'Solidity', 'Vyper', 'Rust (Solana)', 'Move', 'Ethereum', 'Solana',
        'Polygon', 'Binance Smart Chain', 'BSC', 'Avalanche', 'Fantom', 'Arbitrum',
        'Optimism', 'zkSync', 'StarkNet', 'Cosmos', 'Polkadot', 'Cardano',
        'Web3.js', 'ethers.js', 'viem', 'wagmi', 'RainbowKit', 'ConnectKit',
        'WalletConnect', 'MetaMask', 'Hardhat', 'Truffle', 'Foundry', 'Remix',
        'OpenZeppelin', 'Chainlink', 'The Graph', 'IPFS', 'Arweave', 'Filecoin',
        'Alchemy', 'Infura', 'QuickNode', 'Moralis', 'Thirdweb',

        // Game Development
        'Unity', 'Unreal Engine', 'Godot', 'GameMaker Studio', 'Construct',
        'Phaser', 'Phaser.js', 'PixiJS', 'Babylon.js', 'PlayCanvas', 'A-Frame',
        'Cocos2d', 'LibGDX', 'MonoGame', 'Love2D', 'Pygame', 'Panda3D',
        'jMonkeyEngine', 'Bevy', 'Amethyst', 'Defold', 'Corona SDK',

        // IoT & Embedded
        'Arduino', 'Raspberry Pi', 'ESP32', 'ESP8266', 'STM32', 'ARM Cortex',
        'MQTT', 'CoAP', 'Zigbee', 'Z-Wave', 'LoRaWAN', 'BLE', 'Bluetooth Low Energy',
        'Thread', 'Matter', 'HomeKit', 'Alexa Skills Kit', 'Google Assistant',
        'Home Assistant', 'Node-RED', 'PlatformIO', 'Zephyr', 'FreeRTOS',
        'Mbed OS', 'Contiki', 'RIOT OS',

        // Architecture & Design Patterns
        'Microservices', 'Monolithic', 'Service-Oriented Architecture', 'SOA',
        'Event-Driven Architecture', 'EDA', 'CQRS', 'Event Sourcing', 'Saga Pattern',
        'Domain-Driven Design', 'DDD', 'Hexagonal Architecture', 'Clean Architecture',
        'Onion Architecture', 'Ports and Adapters', 'MVC', 'MVP', 'MVVM', 'MVU',
        'Flux', 'Redux', 'Redux Toolkit', 'RTK', 'Zustand', 'Jotai', 'Recoil',
        'MobX', 'XState', 'Valtio', 'Effector', 'Akita', 'NgRx', 'Vuex', 'Pinia',
        'Context API', 'Provider Pattern', 'Observer Pattern', 'Singleton Pattern',
        'Factory Pattern', 'Strategy Pattern', 'Decorator Pattern', 'Adapter Pattern',
        'System Design', 'Distributed Systems', 'CAP Theorem', 'ACID', 'BASE',
        'Eventual Consistency', 'Load Balancing', 'Caching', 'CDN', 'Sharding',
        'Replication', 'Partitioning', 'Circuit Breaker', 'Rate Limiting',
        'API Gateway', 'Service Mesh', 'BFF', 'Backend for Frontend',

        // Protocols & Standards
        'HTTP', 'HTTP/2', 'HTTP/3', 'HTTPS', 'TCP', 'UDP', 'IP', 'DNS', 'DHCP',
        'FTP', 'SFTP', 'SSH', 'Telnet', 'SMTP', 'POP3', 'IMAP', 'WebRTC',
        'WebSocket', 'Server-Sent Events', 'SSE', 'Long Polling', 'gRPC',
        'Thrift', 'Avro', 'MessagePack', 'CBOR', 'BSON', 'JSON', 'XML', 'YAML',
        'TOML', 'INI', 'CSV', 'TSV', 'JSON Schema', 'JSON-LD', 'HAL', 'JSON:API',
        'OpenAPI', 'AsyncAPI', 'CloudEvents', 'W3C', 'WHATWG', 'ECMA', 'RFC',
        'ISO', 'IEEE', 'IETF', 'OWASP Top 10', 'PCI DSS', 'GDPR', 'HIPAA',
        'SOC 2', 'ISO 27001', 'WCAG', 'Accessibility', 'ARIA', 'SEO',
        'Schema.org', 'Open Graph', 'Twitter Cards', 'RSS', 'Atom',

        // Low-Code/No-Code
        'Webflow', 'Bubble', 'Adalo', 'Glide', 'AppGyver', 'Retool', 'Appsmith',
        'Tooljet', 'Budibase', 'n8n', 'Make', 'Integromat', 'Zapier', 'IFTTT',
        'Power Automate', 'Power Apps', 'Mendix', 'OutSystems', 'Airtable',
        'Notion', 'Coda', 'ClickUp', 'Monday.com', 'Asana', 'Jira', 'Linear',
        'Trello', 'Basecamp', 'Height', 'Shortcut', 'Clubhouse',

        // Documentation
        'Markdown', 'MDX', 'AsciiDoc', 'reStructuredText', 'Sphinx', 'MkDocs',
        'Docusaurus', 'VuePress', 'GitBook', 'Read the Docs', 'Swagger UI',
        'ReDoc', 'Stoplight', 'Postman Docs', 'JSDoc', 'TSDoc', 'Javadoc',
        'Doxygen', 'Godoc', 'rustdoc', 'RDoc', 'YARD', 'PHPDoc', 'Pydoc',
        'Sphinx', 'Typedoc', 'API Blueprint', 'RAML',

        // Performance & Optimization
        'Lighthouse', 'WebPageTest', 'Chrome DevTools', 'Firefox DevTools',
        'Safari Web Inspector', 'Core Web Vitals', 'CWV', 'LCP', 'FID', 'CLS',
        'FCP', 'TTI', 'TBT', 'Cumulative Layout Shift', 'First Contentful Paint',
        'Time to Interactive', 'Tree Shaking', 'Code Splitting', 'Lazy Loading',
        'Prefetching', 'Preloading', 'Service Workers', 'PWA', 'Progressive Web App',
        'Workbox', 'IndexedDB', 'LocalStorage', 'SessionStorage', 'Cache API',
        'Image Optimization', 'WebP', 'AVIF', 'Sharp', 'Imagemin', 'Squoosh',
        'Next/Image', 'Nuxt Image', 'Cloudinary', 'Imgix', 'ImageKit',

        // Specific Libraries & Utilities
        'Lodash', 'Underscore', 'Ramda', 'date-fns', 'Day.js', 'Moment.js',
        'Luxon', 'Temporal', 'Yup', 'Zod', 'Joi', 'Ajv', 'Validator.js',
        'class-validator', 'React Hook Form', 'Formik', 'Final Form', 'VeeValidate',
        'i18next', 'react-i18next', 'next-i18next', 'vue-i18n', 'FormatJS',
        'React Intl', 'Polyglot', 'Globalize', 'MessageFormat', 'immer', 'Immutable.js',
        'RxJS', 'Bacon.js', 'Most.js', 'Highland.js', 'fp-ts', 'Ramda',
        'Sanctuary', 'Folktale', 'Crocks', 'ts-belt', 'effect-ts',
    ],
    soft: [
        'Communication', 'Leadership', 'Teamwork', 'Problem Solving', 'Critical Thinking',
        'Time Management', 'Adaptability', 'Creativity', 'Attention to Detail',
        'Project Management', 'Agile', 'Scrum', 'Kanban', 'Mentoring', 'Public Speaking',
        'Conflict Resolution', 'Decision Making', 'Strategic Planning', 'Stakeholder Management',
        'Cross-functional Collaboration', 'Remote Collaboration', 'Technical Writing',
        'Client Communication', 'Negotiation', 'Empathy',
    ],
    language: [
        'English', 'Spanish', 'French', 'German', 'Mandarin Chinese', 'Cantonese',
        'Japanese', 'Korean', 'Portuguese', 'Italian', 'Russian', 'Arabic',
        'Hindi', 'Bengali', 'Urdu', 'Turkish', 'Vietnamese', 'Thai', 'Dutch',
        'Swedish', 'Polish', 'Hebrew', 'Greek', 'Czech', 'Romanian', 'Indonesian',
    ],
};

// ─── Main Component ─────────────────────────────────────────────────────────

export default function ProfilePage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [tab, setTab] = useState<'personal' | 'experience' | 'education' | 'skills' | 'resume' | 'preview'>('personal');

    useEffect(() => {
        profileApi
            .get()
            .then(setData)
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const savePersonal = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage('');
        try {
            const form = e.target as HTMLFormElement;
            const fd = new FormData(form);
            const updates: Record<string, string> = {};
            fd.forEach((val, key) => (updates[key] = val as string));
            const updated = await profileApi.update(updates);
            setData((prev: any) => ({ ...prev, ...updated }));
            setMessage('Profile saved!');
        } catch (err: any) {
            setMessage(`Error: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    // ─── Experience handlers ──────────────────────────────────────────────────

    const [expForm, setExpForm] = useState({
        company: '', title: '', startDate: '', endDate: '', isCurrent: false, description: '',
    });

    const resetExpForm = () => setExpForm({
        company: '', title: '', startDate: '', endDate: '', isCurrent: false, description: '',
    });

    const addExperience = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!expForm.company || !expForm.title || !expForm.startDate) {
            setMessage('Error: Company, title, and start date are required');
            return;
        }
        setSaving(true);
        setMessage('');
        try {
            const payload = {
                company: expForm.company,
                title: expForm.title,
                startDate: new Date(expForm.startDate).toISOString(),
                endDate: expForm.endDate ? new Date(expForm.endDate).toISOString() : null,
                isCurrent: expForm.isCurrent,
                description: expForm.description,
            };
            const exp = await profileApi.addExperience(payload);
            setData((prev: any) => ({ ...prev, experience: [exp, ...(prev.experience || [])] }));
            resetExpForm();
            setMessage('Experience added!');
        } catch (err: any) {
            setMessage(`Error: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    const deleteExperience = async (id: string) => {
        try {
            await profileApi.deleteExperience(id);
            setData((prev: any) => ({ ...prev, experience: prev.experience.filter((e: any) => e.id !== id) }));
        } catch (err: any) {
            setMessage(`Error: ${err.message}`);
        }
    };

    // ─── Education handlers ───────────────────────────────────────────────────

    const [eduForm, setEduForm] = useState({
        institution: '', degree: '', field: '', startDate: '', endDate: '', gpa: '',
    });

    const addEducation = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!eduForm.institution || !eduForm.degree || !eduForm.field || !eduForm.startDate) {
            setMessage('Error: Institution, degree, field, and start date are required');
            return;
        }
        setSaving(true);
        setMessage('');
        try {
            const edu = await profileApi.addEducation({
                ...eduForm,
                startDate: new Date(eduForm.startDate).toISOString(),
                endDate: eduForm.endDate ? new Date(eduForm.endDate).toISOString() : null,
            });
            setData((prev: any) => ({ ...prev, education: [edu, ...(prev.education || [])] }));
            setEduForm({ institution: '', degree: '', field: '', startDate: '', endDate: '', gpa: '' });
            setMessage('Education added!');
        } catch (err: any) {
            setMessage(`Error: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    const deleteEducation = async (id: string) => {
        try {
            await profileApi.deleteEducation(id);
            setData((prev: any) => ({ ...prev, education: prev.education.filter((e: any) => e.id !== id) }));
        } catch (err: any) {
            setMessage(`Error: ${err.message}`);
        }
    };

    // ─── Skills handler ───────────────────────────────────────────────────────

    const [newSkill, setNewSkill] = useState({ name: '', category: 'technical', proficiency: 'intermediate' });
    const [skillSearch, setSkillSearch] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const skillInputRef = useRef<HTMLInputElement>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);

    const filteredSuggestions = useMemo(() => {
        if (!skillSearch || skillSearch.length < 1) return [];
        const existing = new Set((data?.skills || []).map((s: any) => s.name.toLowerCase()));
        const allSuggestions = SKILL_SUGGESTIONS[newSkill.category] || SKILL_SUGGESTIONS.technical;
        return allSuggestions
            .filter((s) =>
                s.toLowerCase().includes(skillSearch.toLowerCase()) &&
                !existing.has(s.toLowerCase())
            )
            .slice(0, 8);
    }, [skillSearch, newSkill.category, data?.skills]);

    // Close suggestions on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (
                suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node) &&
                skillInputRef.current && !skillInputRef.current.contains(e.target as Node)
            ) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const selectSuggestion = (name: string) => {
        setNewSkill({ ...newSkill, name });
        setSkillSearch(name);
        setShowSuggestions(false);
    };

    const addSkill = () => {
        const name = newSkill.name.trim() || skillSearch.trim();
        if (!name) return;
        const skills = [...(data?.skills || []), { name, category: newSkill.category, proficiency: newSkill.proficiency, id: `temp-${Date.now()}` }];
        setData((prev: any) => ({ ...prev, skills }));
        setNewSkill({ name: '', category: newSkill.category, proficiency: 'intermediate' });
        setSkillSearch('');
    };

    const removeSkill = (idx: number) => {
        const skills = [...(data?.skills || [])];
        skills.splice(idx, 1);
        setData((prev: any) => ({ ...prev, skills }));
    };

    const saveSkills = async () => {
        setSaving(true);
        try {
            await profileApi.setSkills(
                (data?.skills || []).map((s: any) => ({ name: s.name, category: s.category, proficiency: s.proficiency }))
            );
            setMessage('Skills saved!');
        } catch (err: any) {
            setMessage(`Error: ${err.message}`);
        } finally {
            setSaving(false);
        }
    };

    // ─── Resume upload handler ────────────────────────────────────────────────

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    const handleResumeUpload = async (file: File) => {
        setUploading(true);
        setMessage('');
        try {
            const result = await profileApi.uploadResume(file);
            setData((prev: any) => ({ ...prev, resumeUrl: result.resumeUrl, resumeFileName: result.resumeFileName }));
            setMessage('Resume uploaded successfully!');
        } catch (err: any) {
            setMessage(`Error: ${err.message}`);
        } finally {
            setUploading(false);
        }
    };

    // ─── Render ───────────────────────────────────────────────────────────────

    if (loading) return <div className="animate-pulse text-muted-foreground">Loading profile...</div>;

    const tabs = [
        { key: 'personal', label: '👤 Personal' },
        { key: 'experience', label: '💼 Experience' },
        { key: 'education', label: '🎓 Education' },
        { key: 'skills', label: '🛠 Skills' },
        { key: 'resume', label: '📄 Resume' },
        { key: 'preview', label: '👁 Preview' },
    ] as const;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Profile</h1>
                <p className="text-muted-foreground">Manage your personal information for auto-filling applications</p>
            </div>

            {message && (
                <div className={`rounded-lg p-3 text-sm ${message.startsWith('Error') ? 'bg-destructive/10 text-destructive' : 'bg-green-500/10 text-green-500'}`}>
                    {message}
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-1 border-b overflow-x-auto">
                {tabs.map(({ key, label }) => (
                    <button
                        key={key}
                        onClick={() => { setTab(key); setMessage(''); }}
                        className={`px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap ${tab === key ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* ═══════════════════ PERSONAL INFO TAB ═══════════════════ */}
            {tab === 'personal' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>Basic contact details used when filling forms</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={savePersonal} className="grid gap-4 sm:grid-cols-2">
                            {[
                                { key: 'firstName', label: 'First Name' },
                                { key: 'lastName', label: 'Last Name' },
                                { key: 'email', label: 'Contact Email', type: 'email' },
                                { key: 'phone', label: 'Phone' },
                                { key: 'city', label: 'City' },
                                { key: 'state', label: 'State' },
                                { key: 'country', label: 'Country' },
                                { key: 'linkedinUrl', label: 'LinkedIn URL', type: 'url' },
                                { key: 'githubUrl', label: 'GitHub URL', type: 'url' },
                                { key: 'portfolioUrl', label: 'Portfolio URL', type: 'url' },
                                { key: 'website', label: 'Website', type: 'url' },
                            ].map(({ key, label, type }) => (
                                <div key={key} className="space-y-1">
                                    <Label htmlFor={key}>{label}</Label>
                                    <Input id={key} name={key} type={type || 'text'} defaultValue={data?.[key] || ''} />
                                </div>
                            ))}
                            <div className="space-y-1 sm:col-span-2">
                                <Label htmlFor="summary">Professional Summary</Label>
                                <Textarea id="summary" name="summary" rows={4} defaultValue={data?.summary || ''} />
                            </div>
                            <div className="sm:col-span-2">
                                <Button type="submit" disabled={saving}>
                                    {saving ? 'Saving…' : 'Save Changes'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* ═══════════════════ EXPERIENCE TAB ═══════════════════ */}
            {tab === 'experience' && (
                <div className="space-y-4">
                    {/* Existing entries */}
                    {(data?.experience || []).map((exp: any) => (
                        <Card key={exp.id}>
                            <CardContent className="flex items-start justify-between p-4">
                                <div>
                                    <h3 className="font-semibold">{exp.title}</h3>
                                    <p className="text-sm text-muted-foreground">{exp.company}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(exp.startDate).toLocaleDateString()} —{' '}
                                        {exp.isCurrent ? 'Present' : exp.endDate ? new Date(exp.endDate).toLocaleDateString() : 'N/A'}
                                    </p>
                                    {exp.description && <p className="mt-1 text-sm">{exp.description}</p>}
                                </div>
                                <Button variant="destructive" size="sm" onClick={() => deleteExperience(exp.id)}>
                                    Remove
                                </Button>
                            </CardContent>
                        </Card>
                    ))}

                    {/* Add form — wrapped in a proper <form> with onSubmit */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Add Experience</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={addExperience} className="grid gap-3 sm:grid-cols-2">
                                <div className="space-y-1">
                                    <Label>Company *</Label>
                                    <Input
                                        value={expForm.company}
                                        onChange={(e) => setExpForm({ ...expForm, company: e.target.value })}
                                        placeholder="Google, Meta, etc."
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label>Title *</Label>
                                    <Input
                                        value={expForm.title}
                                        onChange={(e) => setExpForm({ ...expForm, title: e.target.value })}
                                        placeholder="Software Engineer"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label>Start Date *</Label>
                                    <Input
                                        type="date"
                                        value={expForm.startDate}
                                        onChange={(e) => setExpForm({ ...expForm, startDate: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label>End Date</Label>
                                    <Input
                                        type="date"
                                        value={expForm.endDate}
                                        onChange={(e) => setExpForm({ ...expForm, endDate: e.target.value })}
                                        disabled={expForm.isCurrent}
                                    />
                                </div>
                                <div className="flex items-center gap-2 sm:col-span-2">
                                    <input
                                        type="checkbox"
                                        id="isCurrent"
                                        checked={expForm.isCurrent}
                                        onChange={(e) => setExpForm({ ...expForm, isCurrent: e.target.checked, endDate: '' })}
                                    />
                                    <Label htmlFor="isCurrent">I currently work here</Label>
                                </div>
                                <div className="space-y-1 sm:col-span-2">
                                    <Label>Description</Label>
                                    <Textarea
                                        value={expForm.description}
                                        onChange={(e) => setExpForm({ ...expForm, description: e.target.value })}
                                        rows={3}
                                        placeholder="What did you do in this role?"
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <Button type="submit" disabled={saving}>
                                        {saving ? 'Adding…' : 'Add Experience'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* ═══════════════════ EDUCATION TAB ═══════════════════ */}
            {tab === 'education' && (
                <div className="space-y-4">
                    {(data?.education || []).map((edu: any) => (
                        <Card key={edu.id}>
                            <CardContent className="flex items-start justify-between p-4">
                                <div>
                                    <h3 className="font-semibold">{edu.degree} in {edu.field}</h3>
                                    <p className="text-sm text-muted-foreground">{edu.institution}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(edu.startDate).toLocaleDateString()} —{' '}
                                        {edu.endDate ? new Date(edu.endDate).toLocaleDateString() : 'Present'}
                                    </p>
                                    {edu.gpa && <p className="text-xs">GPA: {edu.gpa}</p>}
                                </div>
                                <Button variant="destructive" size="sm" onClick={() => deleteEducation(edu.id)}>
                                    Remove
                                </Button>
                            </CardContent>
                        </Card>
                    ))}

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Add Education</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={addEducation} className="grid gap-3 sm:grid-cols-2">
                                <div className="space-y-1">
                                    <Label>Institution *</Label>
                                    <Input
                                        value={eduForm.institution}
                                        onChange={(e) => setEduForm({ ...eduForm, institution: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label>Degree *</Label>
                                    <Input
                                        value={eduForm.degree}
                                        onChange={(e) => setEduForm({ ...eduForm, degree: e.target.value })}
                                        placeholder="Bachelor of Science"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label>Field of Study *</Label>
                                    <Input
                                        value={eduForm.field}
                                        onChange={(e) => setEduForm({ ...eduForm, field: e.target.value })}
                                        placeholder="Computer Science"
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label>GPA</Label>
                                    <Input
                                        value={eduForm.gpa}
                                        onChange={(e) => setEduForm({ ...eduForm, gpa: e.target.value })}
                                        placeholder="3.8"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label>Start Date *</Label>
                                    <Input
                                        type="date"
                                        value={eduForm.startDate}
                                        onChange={(e) => setEduForm({ ...eduForm, startDate: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label>End Date</Label>
                                    <Input
                                        type="date"
                                        value={eduForm.endDate}
                                        onChange={(e) => setEduForm({ ...eduForm, endDate: e.target.value })}
                                    />
                                </div>
                                <div className="sm:col-span-2">
                                    <Button type="submit" disabled={saving}>
                                        {saving ? 'Adding…' : 'Add Education'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* ═══════════════════ SKILLS TAB ═══════════════════ */}
            {tab === 'skills' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Skills</CardTitle>
                        <CardDescription>Add your technical, soft, and language skills. Start typing to see suggestions.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Existing skills grouped by category */}
                        {(['technical', 'soft', 'language'] as const).map((cat) => {
                            const catSkills = (data?.skills || []).filter((s: any) => s.category === cat);
                            if (catSkills.length === 0) return null;
                            return (
                                <div key={cat}>
                                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                                        {cat === 'technical' ? '🔧 Technical' : cat === 'soft' ? '🤝 Soft Skills' : '🌐 Languages'}
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {catSkills.map((skill: any, idx: number) => {
                                            const globalIdx = (data?.skills || []).indexOf(skill);
                                            return (
                                                <span
                                                    key={skill.id || idx}
                                                    className="group inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors hover:border-destructive/50"
                                                >
                                                    <span className="font-medium">{skill.name}</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {skill.proficiency === 'expert' ? '★★★★' :
                                                            skill.proficiency === 'advanced' ? '★★★' :
                                                                skill.proficiency === 'intermediate' ? '★★' : '★'}
                                                    </span>
                                                    <button
                                                        onClick={() => removeSkill(globalIdx)}
                                                        className="ml-0.5 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity"
                                                    >
                                                        ×
                                                    </button>
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}

                        {(data?.skills || []).length === 0 && (
                            <p className="text-sm text-muted-foreground italic">No skills added yet. Start typing below to add skills.</p>
                        )}

                        {/* Add skill with autocomplete */}
                        <div className="border-t pt-4">
                            <h4 className="text-sm font-medium mb-3">Add a Skill</h4>
                            <div className="flex flex-wrap gap-2 items-end">
                                <div className="relative">
                                    <Label className="text-xs text-muted-foreground">Skill Name</Label>
                                    <Input
                                        ref={skillInputRef}
                                        placeholder="Start typing... e.g. React, Python"
                                        value={skillSearch}
                                        onChange={(e) => {
                                            setSkillSearch(e.target.value);
                                            setNewSkill({ ...newSkill, name: e.target.value });
                                            setShowSuggestions(true);
                                        }}
                                        onFocus={() => setShowSuggestions(true)}
                                        className="w-56"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                addSkill();
                                            }
                                            if (e.key === 'Escape') setShowSuggestions(false);
                                        }}
                                    />
                                    {/* Autocomplete dropdown */}
                                    {showSuggestions && filteredSuggestions.length > 0 && (
                                        <div
                                            ref={suggestionsRef}
                                            className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg max-h-48 overflow-y-auto"
                                        >
                                            {filteredSuggestions.map((suggestion) => (
                                                <button
                                                    key={suggestion}
                                                    type="button"
                                                    onClick={() => selectSuggestion(suggestion)}
                                                    className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                                                >
                                                    {suggestion}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <Label className="text-xs text-muted-foreground">Category</Label>
                                    <select
                                        value={newSkill.category}
                                        onChange={(e) => {
                                            setNewSkill({ ...newSkill, category: e.target.value });
                                            setSkillSearch('');
                                        }}
                                        className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    >
                                        <option value="technical">🔧 Technical</option>
                                        <option value="soft">🤝 Soft Skill</option>
                                        <option value="language">🌐 Language</option>
                                    </select>
                                </div>

                                <div>
                                    <Label className="text-xs text-muted-foreground">Proficiency</Label>
                                    <select
                                        value={newSkill.proficiency}
                                        onChange={(e) => setNewSkill({ ...newSkill, proficiency: e.target.value })}
                                        className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    >
                                        <option value="beginner">★ Beginner</option>
                                        <option value="intermediate">★★ Intermediate</option>
                                        <option value="advanced">★★★ Advanced</option>
                                        <option value="expert">★★★★ Expert</option>
                                    </select>
                                </div>

                                <Button variant="outline" onClick={addSkill} className="h-10">
                                    + Add
                                </Button>
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <Button onClick={saveSkills} disabled={saving}>
                                {saving ? 'Saving…' : 'Save Skills'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* ═══════════════════ RESUME TAB ═══════════════════ */}
            {tab === 'resume' && (
                <Card>
                    <CardHeader>
                        <CardTitle>Resume</CardTitle>
                        <CardDescription>Upload your resume file or provide a link</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Current resume status */}
                        {data?.resumeFileName && (
                            <div className="flex items-center gap-3 rounded-lg border border-green-500/20 bg-green-500/10 p-4">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/15 text-green-500 text-lg">
                                    📄
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">{data.resumeFileName}</p>
                                    <p className="text-xs text-muted-foreground">Currently uploaded</p>
                                </div>
                                {data?.resumeUrl && (
                                    <a
                                        href={data.resumeUrl.startsWith('/') ? `http://localhost:4000${data.resumeUrl}` : data.resumeUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-primary underline hover:no-underline"
                                    >
                                        View ↗
                                    </a>
                                )}
                            </div>
                        )}

                        {/* File upload section */}
                        <div>
                            <h4 className="text-sm font-medium mb-3">Upload from Computer</h4>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-primary', 'bg-primary/5'); }}
                                onDragLeave={(e) => { e.currentTarget.classList.remove('border-primary', 'bg-primary/5'); }}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    e.currentTarget.classList.remove('border-primary', 'bg-primary/5');
                                    const file = e.dataTransfer.files[0];
                                    if (file) handleResumeUpload(file);
                                }}
                                className="relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 p-8 transition-colors hover:border-primary/50 hover:bg-muted/50 cursor-pointer"
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf,.doc,.docx"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) handleResumeUpload(file);
                                        e.target.value = ''; // Reset so same file can be selected again
                                    }}
                                    className="hidden"
                                />
                                <div className="text-4xl mb-3">
                                    {uploading ? '⏳' : '📎'}
                                </div>
                                <p className="text-sm font-medium">
                                    {uploading ? 'Uploading...' : 'Click to select or drag & drop your resume'}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">PDF, DOC, or DOCX (max 10MB)</p>
                            </div>
                        </div>

                        {/* URL fallback */}
                        <div className="border-t pt-6">
                            <h4 className="text-sm font-medium mb-3">Or paste a link</h4>
                            <form
                                onSubmit={async (e) => {
                                    e.preventDefault();
                                    setSaving(true);
                                    setMessage('');
                                    try {
                                        const form = e.target as HTMLFormElement;
                                        const fd = new FormData(form);
                                        const updates: Record<string, string> = {};
                                        fd.forEach((val, key) => (updates[key] = val as string));
                                        const updated = await profileApi.update(updates);
                                        setData((prev: any) => ({ ...prev, ...updated }));
                                        setMessage('Resume info saved!');
                                    } catch (err: any) {
                                        setMessage(`Error: ${err.message}`);
                                    } finally {
                                        setSaving(false);
                                    }
                                }}
                                className="grid gap-4"
                            >
                                <div className="space-y-1">
                                    <Label htmlFor="resumeUrl">Resume URL</Label>
                                    <Input
                                        id="resumeUrl"
                                        name="resumeUrl"
                                        type="url"
                                        placeholder="https://drive.google.com/file/d/..."
                                        defaultValue={data?.resumeUrl || ''}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="resumeFileName">Resume File Name</Label>
                                    <Input
                                        id="resumeFileName"
                                        name="resumeFileName"
                                        placeholder="John_Doe_Resume_2025.pdf"
                                        defaultValue={data?.resumeFileName || ''}
                                    />
                                </div>
                                <div>
                                    <Button type="submit" variant="outline" disabled={saving}>
                                        {saving ? 'Saving…' : 'Save Link'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* ═══════════════════ PREVIEW TAB ═══════════════════ */}
            {tab === 'preview' && <ProfilePreview data={data} />}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Profile Preview Component
// ═══════════════════════════════════════════════════════════════════════════════

function ProfilePreview({ data }: { data: any }) {
    if (!data) {
        return <p className="text-muted-foreground">No profile data to preview.</p>;
    }

    const fullName = [data.firstName, data.lastName].filter(Boolean).join(' ') || 'Your Name';
    const location = [data.city, data.state, data.country].filter(Boolean).join(', ');

    return (
        <div className="space-y-6 max-w-3xl">
            {/* Header / Hero */}
            <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-primary/5 via-background to-primary/10">
                <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-primary/5 -translate-y-32 translate-x-32" />
                <div className="relative p-8">
                    <div className="flex items-start gap-6">
                        {/* Avatar placeholder */}
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary/10 text-3xl font-bold text-primary">
                            {data.firstName?.[0]?.toUpperCase() || '?'}{data.lastName?.[0]?.toUpperCase() || ''}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-2xl font-bold tracking-tight">{fullName}</h2>
                            {data.experience?.[0]?.title && (
                                <p className="text-lg text-muted-foreground">
                                    {data.experience[0].title}
                                    {data.experience[0].company && <> at <span className="text-foreground font-medium">{data.experience[0].company}</span></>}
                                </p>
                            )}
                            {location && (
                                <p className="text-sm text-muted-foreground mt-1">📍 {location}</p>
                            )}
                            {/* Contact links */}
                            <div className="flex flex-wrap gap-3 mt-3">
                                {data.email && (
                                    <a href={`mailto:${data.email}`} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                                        <span>✉️</span> {data.email}
                                    </a>
                                )}
                                {data.phone && (
                                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                        <span>📱</span> {data.phone}
                                    </span>
                                )}
                                {data.linkedinUrl && (
                                    <a href={data.linkedinUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline transition-colors">
                                        <span>💼</span> LinkedIn
                                    </a>
                                )}
                                {data.githubUrl && (
                                    <a href={data.githubUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                                        <span>🐙</span> GitHub
                                    </a>
                                )}
                                {data.portfolioUrl && (
                                    <a href={data.portfolioUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                                        <span>🌐</span> Portfolio
                                    </a>
                                )}
                                {data.website && (
                                    <a href={data.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                                        <span>🔗</span> Website
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                    {data.summary && (
                        <p className="mt-4 text-sm leading-relaxed text-muted-foreground border-t pt-4">
                            {data.summary}
                        </p>
                    )}
                </div>
            </div>

            {/* Experience Section */}
            {(data.experience?.length > 0) && (
                <div className="rounded-xl border p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/15 text-blue-500 text-sm">💼</span>
                        Work Experience
                    </h3>
                    <div className="space-y-0">
                        {data.experience.map((exp: any, idx: number) => (
                            <div key={exp.id} className="relative pl-8 pb-6 last:pb-0">
                                {/* Timeline line */}
                                {idx < data.experience.length - 1 && (
                                    <div className="absolute left-[11px] top-6 bottom-0 w-[2px] bg-border" />
                                )}
                                {/* Timeline dot */}
                                <div className={`absolute left-0 top-1.5 h-6 w-6 rounded-full border-2 flex items-center justify-center ${exp.isCurrent || idx === 0
                                        ? 'border-primary bg-primary/10'
                                        : 'border-muted-foreground/30 bg-background'
                                    }`}>
                                    <div className={`h-2 w-2 rounded-full ${exp.isCurrent || idx === 0 ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
                                </div>
                                <div>
                                    <h4 className="font-semibold">{exp.title}</h4>
                                    <p className="text-sm text-primary font-medium">{exp.company}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} —{' '}
                                        {exp.isCurrent ? (
                                            <span className="text-green-600 font-medium">Present</span>
                                        ) : exp.endDate ? (
                                            new Date(exp.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                                        ) : 'N/A'}
                                    </p>
                                    {exp.description && (
                                        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{exp.description}</p>
                                    )}
                                    {exp.technologies?.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mt-2">
                                            {exp.technologies.map((tech: string) => (
                                                <Badge key={tech} variant="secondary" className="text-[10px] px-2 py-0.5">{tech}</Badge>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Education Section */}
            {(data.education?.length > 0) && (
                <div className="rounded-xl border p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/15 text-purple-500 text-sm">🎓</span>
                        Education
                    </h3>
                    <div className="space-y-4">
                        {data.education.map((edu: any) => (
                            <div key={edu.id} className="flex gap-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500 text-lg font-bold">
                                    {edu.institution?.[0]?.toUpperCase() || '?'}
                                </div>
                                <div>
                                    <h4 className="font-semibold">{edu.degree} in {edu.field}</h4>
                                    <p className="text-sm text-primary font-medium">{edu.institution}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(edu.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} —{' '}
                                        {edu.endDate ? new Date(edu.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Present'}
                                        {edu.gpa && <> · GPA: <span className="font-medium">{edu.gpa}</span></>}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Skills Section */}
            {(data.skills?.length > 0) && (
                <div className="rounded-xl border p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15 text-amber-500 text-sm">🛠</span>
                        Skills
                    </h3>
                    <div className="space-y-4">
                        {(['technical', 'soft', 'language'] as const).map((cat) => {
                            const catSkills = data.skills.filter((s: any) => s.category === cat);
                            if (catSkills.length === 0) return null;
                            return (
                                <div key={cat}>
                                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                                        {cat === 'technical' ? 'Technical' : cat === 'soft' ? 'Soft Skills' : 'Languages'}
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {catSkills.map((skill: any) => {
                                            const colors: Record<string, string> = {
                                                expert: 'bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/20',
                                                advanced: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20',
                                                intermediate: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20',
                                                beginner: 'bg-muted text-muted-foreground border-border',
                                            };
                                            return (
                                                <span
                                                    key={skill.id || skill.name}
                                                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${colors[skill.proficiency] || colors.intermediate}`}
                                                >
                                                    {skill.name}
                                                    <span className="opacity-60">
                                                        {skill.proficiency === 'expert' ? '★★★★' :
                                                            skill.proficiency === 'advanced' ? '★★★' :
                                                                skill.proficiency === 'intermediate' ? '★★' : '★'}
                                                    </span>
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Resume Section */}
            {(data.resumeFileName || data.resumeUrl) && (
                <div className="rounded-xl border p-6">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/15 text-red-500 text-sm">📄</span>
                        Resume
                    </h3>
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-500/10 text-2xl">📄</div>
                        <div>
                            <p className="font-medium">{data.resumeFileName || 'Resume'}</p>
                            {data.resumeUrl && (
                                <a
                                    href={data.resumeUrl.startsWith('/') ? `http://localhost:4000${data.resumeUrl}` : data.resumeUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-primary hover:underline"
                                >
                                    View / Download ↗
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Empty state */}
            {!data.firstName && !data.experience?.length && !data.education?.length && !data.skills?.length && (
                <div className="rounded-xl border border-dashed p-12 text-center">
                    <p className="text-4xl mb-3">👤</p>
                    <p className="text-lg font-medium">Your profile is empty</p>
                    <p className="text-sm text-muted-foreground mt-1">Start by filling in your personal information, experience, and skills.</p>
                </div>
            )}
        </div>
    );
}
