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
- Call recording with opt-in option for EMEA
- Web-based ingress
- Website authentication through Amazon Cognito
- Website with realtime Hours of Operation schedule
- Website click to call, Amazon Connect placing outbound call to customer
- Infrastruce as code using AWS-CDK

## Architecture

The contact center solution consists of an Amazon Connect instance, a website host on CloudFront, an API Gateway, several Lambda functions, and DynamoDB tables.

The Amazon Connect instance is configured manually but most other AWS resources are configured and deployed using AWS-CDK.

![Architecture Diagram](/jam-cc-Architecture.drawio.png)

## Amazon Connect

**Contact Flows**

- Account
- IntroInbound
- Main
- MainQueue
- Sales
- Support
- Survey
- WebIngress
- SetRecording (module)

**Queues**

- Account-Balance
- Account-Close
- Account-Lock
- Account-Open
- Sales-AMER
- Sales-APAC
- Sales-EMEA
- Support-Mobile
- Support-Product
- Product-Website

### High level view of flows

![High level view](/jam-cc-ContactFlows.drawio.png)

### Dynamic Prompts

When a customer reaches the `IntroInboud flow`, they here the welcome message and then have the option to continue in Spanish, if desired.  The selected language, English or Spanish is set in the System Language attribute to be referenced throughout the rest of the flows.  For each contact flow, there is am item stored in DynamoDB containing the prompts used in that flow.  A Lambda is invoked at the start of each flow and passes both the `contactFlowName` and `languageCode` as parameters.  These are used to pull the relevant prompts in the target language and returned to Amazon Connect to be referenced in Play Prompts throughout the flow.  The advantage to this feature is that prompts can be updated without needing to update and publish contact flows.  A custom user interface can be built to allow business stakeholders the ability to maintain prompt messaging without engaging the tech team.  This can be extended to include special messaging to be played at specific points in the flow to broadcast to all customers about global alerts, emergency situations, issues, holiday closures, or any other situation which may not always needed.

### Customer Data Lookup

This solution also performs a customer data lookup to attempt to find any stored information about a customer.  A Lambda is invoked at the start of the `Main` flow.  The Lambda will reference the `CustomerEndpoint.Address` in the standard ConnectContactFlowEvent and use that to attempt to get customer data from DynamoDB.  In the event that there is no data found, the flow will continue normally.  If an item is found and returned to Amazon Connect, the attributes will be written to the Contact Record.  In this case, the only attribute used further in the flow is the `VIP` attribute.  If this is true, the routing priority will be increased for that contact.  A custom agent workspace could reference this data when the call is incoming to the CCP to do screen pops or fetch customer data from that system

### Call Recordings

Call recordings are set in the module SetRecording.  This module flow has two paths. For any customer going to Sales-EMEA queue, it is assumed the customer is from Europe where data privacy regulations may require call recording to be opt-in only.  This path will present the caller with the opt-in recording disclosure and require the customer to press 1 to opt-in to recording, otherwise the call will not be recorded.  All other customers not going to Sales-EMEA will default to have call recordings and hear a recording disclosure.  An attribute is saved to the Contact Record to capture if the customer recordingConsent is `default`, `decline`, or `opt-in`.

### Post-call survey

The survey is a disconnect flow, configured to execute when an agent disconnects from a call and the customer remains.  This survey presents three statements, in the selected language of the customer, where the customer will use DTMF to select the desired option.  This solution ranks the statments 1 - 5, where 1 is strongly agree and 5 is strongly disagree.  These responses are saved on Contact Record for reporting purposes.

## Frontend Website

The deployed frontend website for this solution is a simple, mock business website dealing with contact center development and services.  The website is deployed to CloudFront and leverages Amazon Cognito for authentication.  The website is only accessible to authenticated users.  After authentication, there is a simple home page but the important functionality is on the live support page.  The live support page shows the list of the different departments and queues for each, matching the listed queues above.  Here the customer can select the one they need, see a brief summary of the queue, and see the hours of operation schedule for that queue.  The customer may then enter their phone number in the input field and click the "Start Call" button.  If succesful, the customer will receive a call within a few seconds and connect to the `WebIngress` flow.  This is a streamlined flow that uses the selected queue from the frontend to set in the flow, presents the call recording disclosure, and goes straight to the queue.  This allows the customer to get to where they need to be without the hassle of navigating the menus.

This solution does not pass additional attributes from the frontend besides the queueId to Amazon Connect.  However, other attributes could be sent regarding who the user is, their account id, their verification status, or any other relevant information to carry over to Amazon Connect and the support agent.

The live support page shows the hours of operation schedule for the selected queue.  This is fetched in realtime using the API Gateway endpoint.  This allows the customer to know if the queue is currently open or when it will be open next if closed.  This also allows the website to show the most updated hours of operation without any deployment as it may be updated at any time in Amazon Connect.

## Backend API for Frontend Website

This API Gateway uses an Amazon Cognito authorizer for authentication to call the API.  The `idToken` is returned from Amazon Cognito to the frontend after logging in to the website.  This `idToken` is passed in the Authorization header for the API calls.

**/connect/hours**

Method: POST

Request Parameters:

```json
{
  "hoursOfOperationId": "hours-of-operation-id"
}
```

Response:

Config will contain each day configured

```json
{
  "data": {
    "Config": [
      {
        "Day": "day",
        "EndTime": { "Hours": 0, "Minutes": 0 },
        "StartTime": { "Hours": 0, "Minutes": 0 }
      }
    ],
    "Description": "description",
    "HoursOfOperationArn": "hours-of-operation-arn",
    "HoursOfOperationId": "hours-of-operation-id",
    "LastModifiedRegion": "aws-region",
    "LastModifiedTime": "timestamp",
    "Name": "hours-of-operation-name",
    "Tags": {},
    "TimeZone": "timezone"
  }
}
```

**/connect/contact**

Method: POST

Request Parameters:

```json
{
  "destinationPhoneNumber": "phone-number",
  "contactFlowId": "contact-flow-id",
  "attributes": {
    "key": "value"
  }
}
```

Response:

```json
{
  "body": { "ContactId": "contactId" }
}
```

## DynamoDB Schemas

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
  "VIP": "true | false"
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

Forntend

- React
- Vite
- Bulma CSS
- AWS-SDK V3 for JavaScript/TypeScript

## Next Steps

**Verification**

Inbound callers to the IVR can go through an automated verification process prior to reaching a queue which can save agent time. This verificaiton process can include asking knowledge based questions, providing a PIN value, or through an One-time Passcode (OTP) process. Since the web-based ingress solution requires authentication before starting a call, these customers can be marked verified while starting the call which avoids verification in the IVR as well as with the agent. Each business has it's own security standards so that would ultimately determined the right verificaiton solution.

**Self Service**

Some issues are simple enough that they can be automated using Amazon Lex. This can be used to accomplish account lookups or other simple actions related to accounts. Information and polices can be fetched using Amazon Lex and read out to customers. Amazon Bedrock and Gen-AI models can also be integrated for retrieving and summarizing information from a curated knowledge base.

**SMS**

Following on the self service options, Amazon Connect can send SMS to customers with the results of their self service actions or summaries of the information and policies that were presented in the IVR.  