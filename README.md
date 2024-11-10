# JAM Contact Center

## Overview

This project is a contact center solution using Amazon Connect and Amazon Web Services (AWS). It provides support for standard inbound and outbound calls as well as web-based ingress outbound calls.

## Problem Statement

Traditional IVRs are very straightfoward and work well to get customers where they need to go. However, they can become quite complex and take time to navigate all the menus and sub-menus. Customer may also find out they are getting to the wrong place either through vague menu prompts or just selecting the incorrect option.

Automated bots, such as Amazon Lex, are definitely a viable solution to this problem and can be used to gather intents from the user or even provide self-service. But similar problems can arise with bots that either can't determine the correct intent or do not support the issue.

## Solution

The solution presented here is to offer a web-based method of selecting issues or intent and have the system call the customer directly. This action will initiate an automatic outbound call from Amazon Connect after receving relevant customer details from the website. Because the issue or intent is already known, the customer can be placed in a streamlined contact flow that sets and transfers directly to the correct queue. This avoids the standard process of navigating menus and potential confusion with getting to the right support agent.

This contact center has three main departments for support: Sales, Accounts, and Support. Each main department has multiple queues broken down by type or skill set. Customers can call the inbound number to reach the introduction contact flow. There, the customer can switch to Spanish if desired and the remaining prompts will be in that language. A customer lookup is executed by invoking a Lambda and using the customer phonenumber to determine if this is a known customer. If so, their name and VIP status will be set as an attribute. The name attribute can be used with a custom Contact Control Panel (CCP) to automatically pull up their account record. In this solution, the VIP status can be used to adjust the routing priority for the destination queue. While waiting in the queue, the customer may opt to receive a callback if wait times are long. After the agent interaction is complete, the customer may participate in a post-call survey of three questions to rate their experience with the agent.

## Features

- Inbound/Outbound calls
- Dynamic prompts based on language
- Customer data lookups
- Routing priority adjustment for VIP callers
- Post-call survey
- Callbacks
- Web-based ingress
- Website access through Amazon Cognito
- Website with realtime Hours of Operation Schedule
- Website click to call, Amazon Connect placing outbound call to customer
- Infrastruce as code using AWS-CDK

## Architecture

The contact center solution consists of an Amazon Connect instance, a website host on CloudFront, an API Gateway, several Lambda functions, and DynamoDB tables.

The Amazon Connect instance is configured manually but most other AWS resources are configured and deployed using AWS-CDK.

![Architecture Diagram](/jam-cc-Architecture.drawio.png)

## Amazon Connect

**Queues**

## API

**/connect/hours**

Method: POST

```json
{
  "hoursOfOperationId": "hours-of-operation-id"
}
```

**/connect/contact**

Method: POST

```json
{
  "destinationPhoneNumber": "phone-number",
  "contactFlowId": "contact-flow-id",
  "attributes": {
    "key": "value"
  }
}
```

## Schemas

**Prompts**

Primary Key: `ContactFlowName`

PromptText can have any number of keys using standard language codes as the key.

```json
{
  "ContactFlowName": "contact-flow-name",
  "Prompts": [
    {
      "Id": "message-id",
      "PromptText": {
        "en-US": "english-prompt",
        "es-US": "spanish-prompt"
      }
    }
  ]
}
```

**CustomerData**

Primary Key: `PhoneNumber`

Data object can contain additional fields as needed to help drive functionality or customer segmentation in the IVR.

```json
{
 "PhoneNumber": "phone-number",
 "FirstName": "first-name",
 "LastName": "last-name",
 "VIP": "true" | "false"
}
```

## Technologies and Services used

AWS

- Amazon Connect
- CloudFront
- API Gateway
- AWS Lambda
  - AWS-SDK V3 for JavaScript/TypeScript
- Amazon DynamoDB
- AWS S3
- Amazon Cognito
- IAM
- CloudFormation
- CloudWatch

Website

- React
- Vite
- Bulma CSS
- AWS-SDK V3 for JavaScript/TypeScript

## Next Steps

**Verification**

Inbound callers to the IVR can go through an automated verification process prior to reaching a queue which can save agent time. This verificaiton process can include asking knowledge based questions, providing a PIN value, or through an One-time Passcode (OTP) process. Since the web-based ingress solution requires authentication before starting a call, these customers can be marked verified while starting the call which avoids verification in the IVR as well as with the agent. Each business has it's own security standards so that would ultimately determined the right verificaiton solution.

**Self Service**

Some issues are simple enough that they can be automated using Amazon Lex. This can be used to accomplish account lookups or other simple actions related to accounts. Information and polices can be fetched using Amazon Lex and read out to customers. Amazon Bedrock and Gen-AI models can also be integrated for retrieving and summarizing information from a curated knowledge base.
