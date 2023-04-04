FROM node:15 as lambda

ARG PORT=8000
ENV PORT=$PORT
WORKDIR /usr/src
COPY . .
# Install zip in container
RUN apt-get update
RUN apt-get install zip
# Enter the src directory, install dependencies, and zip the src directory in the container
RUN cd src && npm install && zip -r lambdas.zip .

FROM localstack/localstack
# Copy lambdas.zip into the localstack directory
COPY --from=lambda /usr/src/src/lambdas.zip ./lambdas.zip