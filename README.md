# Customer Portal

A customer website with a user portal. 


## Stack References
- Frontend: https://github.com/joaopaulomoraes/reactjs-vite-tailwindcss-boilerplate
- Backend and Middleware: Supabase
- n8n

## Future Development
- The current system is using n8n to send stripe invoices directly via email to the customer.
- Future goal is to display the invoice in this portal and have the custom pay when logged into the portal.
- Data is then tracked by Supabase. Invoices and Payments.

## Directory
- Frontend (Customer): React Vite (TS, Tailwind)
- Admin Portal: React Vite
- Model: Supabase (BaaS)

## Frontend - Customer Portal

Replace, Supabase

## Admin Portal

- Vite React + Supabase
- Differing levels of access

### Account Management 

#### - Next Steps:

 Option 2: Supabase Dashboard

  1. Go to your Supabase project dashboard
  2. Navigate to Edge Functions in the left sidebar
  3. Click Manage Secrets (or look for "Secrets" tab)
  4. Click Add new secret
  5. Add each key-value pair:
    - RESEND_API_KEY → your Resend API key
    - EMAIL_FROM → your sending email address
    - TWILIO_ACCOUNT_SID → your Twilio account SID
    - TWILIO_AUTH_TOKEN → your Twilio auth token
    - TWILIO_PHONE_NUMBER → your Twilio phone number

  Getting the API Keys:

  | Service | Where to Get                                                       |
  |---------|--------------------------------------------------------------------|
  | Resend  | https://resend.com/api-keys                                        |
  | Twilio  | https://console.twilio.com (Account SID & Auth Token on dashboard) |

  Note: You only need to configure the service(s) you want to use. If you only want email verification, just set the Resend keys. Without keys configured, codes are logged to the Edge Function logs for testing. 

****************************************************************************
  **** CONSIDER LOOKING INTO POSTMARK AND MAILGUN ****** MAIL SERVICES ***
****************************************************************************
Mailgun appears to be cheaper

#### - System Needs

- AI Support Chat Bot (optional)
- Support Chat Window (optional)
- Ticket System
- [x] Change User's Email (in the possibility an account was hacked.)
  - [] still requires Resend.com
- [x] Display First and Last Name either above in the User's table on the /admin app
- [x] Need some type of notification for a user when: -  
    (/admin - Add to Users Table and User Details)
    - Created an account
    - Added Billing info
    - Added a Service

    - [] will need email notification using Resend.com

- [x] Create Services section on /admin panel
  - Add New Service
  - Make Service Publically Available
  - Add Contract
  - Additional Conditions Form
  - Etc. 
- [x] Disable / Suspend Services for a user. The user cannot re-enable this on thier end. An Admin or Manager must re-enable users/...
  and reflect changes on customer (frontend)
  clicking a suspend on service will require the admin/manager to define the reason. 
  
- A way to track past due invoices
