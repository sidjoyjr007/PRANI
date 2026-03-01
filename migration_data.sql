-- Prani DB Migration Export
-- Generated: 2026-03-01T21:22:06.986586
-- Tables: agents, users, tools, user_tool_secrets, llms, llm_secrets, mcp_servers, mcp_secrets
-- Excluded: conversations, messages

BEGIN;

-- ============================================
-- Table: agents
-- ============================================
DELETE FROM agents;

INSERT INTO agents ("id", "name", "description", "capabilities", "tool_ids", "mcp_server_ids", "llm_id", "human_in_loop", "is_active", "created_at", "updated_at", "owner_id", "is_public") VALUES ('ca74fd26-aea0-44d5-885a-20b98690bb59', 'User 1 Agent', 'Private agent', '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, NULL, FALSE, TRUE, '2026-02-22 17:17:22.532127+00:00', '2026-02-22 17:17:22.532127+00:00', 'a1531897-0d85-46b7-a95d-640ddc7bf3b5', FALSE);
INSERT INTO agents ("id", "name", "description", "capabilities", "tool_ids", "mcp_server_ids", "llm_id", "human_in_loop", "is_active", "created_at", "updated_at", "owner_id", "is_public") VALUES ('6c7f42ce-4b00-4041-b9d3-9b389799859e', 'Test Agent', 'A test agent', '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, '7f9d5c88-b978-4f0a-9e57-5740da0c3318', FALSE, TRUE, '2026-02-19 13:18:19.366185+00:00', '2026-02-19 13:18:19.366185+00:00', NULL, TRUE);
INSERT INTO agents ("id", "name", "description", "capabilities", "tool_ids", "mcp_server_ids", "llm_id", "human_in_loop", "is_active", "created_at", "updated_at", "owner_id", "is_public") VALUES ('47ac65f8-36c6-4154-b75d-e4510f08412e', 'Math Agent', 'Specialized in solving math problems.', 'addition, subtraction, multiplication, division', '[]'::jsonb, '[]'::jsonb, '197bf867-78ae-4caf-9c3d-06a68f61e6ce', FALSE, TRUE, '2026-02-21 07:07:02.898303+00:00', '2026-02-21 07:17:35.196575+00:00', NULL, TRUE);
INSERT INTO agents ("id", "name", "description", "capabilities", "tool_ids", "mcp_server_ids", "llm_id", "human_in_loop", "is_active", "created_at", "updated_at", "owner_id", "is_public") VALUES ('087c060f-4cca-4528-8b5e-83d3ce887ffa', 'Crypto_and_search_agent', 'It is a crypto agent and web search agent fetches details about cryptos and searches web', '["fetch-crypto-info", "web-search", "send-email"]'::jsonb, '["01cc5fa2-c15e-49f6-b59d-5b892cb4e0e8", "0b3f71c7-8e15-4e94-bade-2d91608e79c1"]'::jsonb, '["0e392278-7f58-46ca-84af-e94ad5011495"]'::jsonb, '197bf867-78ae-4caf-9c3d-06a68f61e6ce', TRUE, TRUE, '2026-02-18 18:19:08.486066+00:00', '2026-02-24 13:58:43.809776+00:00', NULL, TRUE);

-- ============================================
-- Table: users
-- ============================================
DELETE FROM users;

INSERT INTO users ("id", "name", "email", "password_hash", "is_verified", "is_active", "created_at", "updated_at") VALUES ('6d5c4cda-ef76-442d-8cea-7069731f1266', 'siddesh', 'sidjoyjr@gmail.com', '$argon2id$v=19$m=65536,t=3,p=4$TalVihFiDMH431sL4XwPAQ$N7pu7vMTiuVn7ZCTkNfAIKJ54io0oHLy8Wv65yn4YiQ', FALSE, TRUE, '2026-02-15 07:19:33.377260', '2026-02-15 07:19:33.377260');
INSERT INTO users ("id", "name", "email", "password_hash", "is_verified", "is_active", "created_at", "updated_at") VALUES ('f3f4dafb-bd5c-42bb-bb71-ff63d0ca6324', 'siddesh', 'siddesh976@gmail.com', '$argon2id$v=19$m=65536,t=3,p=4$yZlzLgVAiPG+dw7h3Lu3Ng$7lZYqze0ybdtg+NdS5P58FJZ4NPhSdbO+9HbEABnR8o', TRUE, TRUE, '2026-02-15 07:13:33.252346', '2026-02-15 07:30:25.535675');
INSERT INTO users ("id", "name", "email", "password_hash", "is_verified", "is_active", "created_at", "updated_at") VALUES ('b0884b32-1ed5-4079-8703-ba8c7bacbaea', 'Test User', 'test_770e9806@example.com', '$argon2id$v=19$m=65536,t=3,p=4$3DsnBEDoXeu9t1ZKaY0xpg$JtbS3rj9OuKNoSYzbOZIeu5nVIHIjWNwYep0gG7GtiE', TRUE, TRUE, '2026-02-17 13:31:54.372862', '2026-02-17 13:31:57.735686');
INSERT INTO users ("id", "name", "email", "password_hash", "is_verified", "is_active", "created_at", "updated_at") VALUES ('93af74dd-abcd-4e26-9d10-e579627607ca', 'Test User', 'test_c8baf415@example.com', '$argon2id$v=19$m=65536,t=3,p=4$W2uNkfJeS+ldCwFgTInROg$itafnrt6+dTYKyV50w0EB6WAn+HWwWS9r31alMxWL2M', TRUE, TRUE, '2026-02-17 13:35:05.252130', '2026-02-17 13:35:08.283022');
INSERT INTO users ("id", "name", "email", "password_hash", "is_verified", "is_active", "created_at", "updated_at") VALUES ('df52e3d3-e15d-4da6-a1bc-77a66eb7622a', 'Test User', 'test_1771507075@example.com', '$argon2id$v=19$m=65536,t=3,p=4$9l4rhVAqBQAAwJiTkrIWYg$1LC+TrE47n6etE9Nmwfiy8j5zQQYR69f0Rzz8ogQ8t8', TRUE, TRUE, '2026-02-19 13:17:55.502379', '2026-02-19 13:17:58.742601');
INSERT INTO users ("id", "name", "email", "password_hash", "is_verified", "is_active", "created_at", "updated_at") VALUES ('23563c0e-71e9-4b0a-9193-334850cd2556', 'Test User', 'test_1771507096@example.com', '$argon2id$v=19$m=65536,t=3,p=4$h7D2/h9DiFHqXStlTCkFYA$yqVGgYwl9ryNzJznEW+ScyeZdCE9dxqLFvTxAfV6CAI', TRUE, TRUE, '2026-02-19 13:18:16.539688', '2026-02-19 13:18:19.293731');
INSERT INTO users ("id", "name", "email", "password_hash", "is_verified", "is_active", "created_at", "updated_at") VALUES ('a1531897-0d85-46b7-a95d-640ddc7bf3b5', 'User 1', 'user1_51d1@example.com', 'pw', FALSE, TRUE, '2026-02-22 17:17:22.524428', '2026-02-22 17:17:22.524428');
INSERT INTO users ("id", "name", "email", "password_hash", "is_verified", "is_active", "created_at", "updated_at") VALUES ('b762857f-bb2a-44d9-adba-0bc3cb058459', 'User 2', 'user2_63f8@example.com', 'pw', FALSE, TRUE, '2026-02-22 17:17:22.524428', '2026-02-22 17:17:22.524428');
INSERT INTO users ("id", "name", "email", "password_hash", "is_verified", "is_active", "created_at", "updated_at") VALUES ('87dfb5fc-7699-49d2-a875-bc1c0b29a339', 'User 1', 'user1_1770@example.com', 'pw', FALSE, TRUE, '2026-02-22 17:17:22.542513', '2026-02-22 17:17:22.542513');
INSERT INTO users ("id", "name", "email", "password_hash", "is_verified", "is_active", "created_at", "updated_at") VALUES ('1153073d-0d40-439b-a81e-dd4bbd428801', 'User 2', 'user2_0a58@example.com', 'pw', FALSE, TRUE, '2026-02-22 17:17:22.542513', '2026-02-22 17:17:22.542513');
INSERT INTO users ("id", "name", "email", "password_hash", "is_verified", "is_active", "created_at", "updated_at") VALUES ('48ada6df-2e68-49e5-88b8-8a0a24d9d7ac', 'User 1', 'user1_d1be@example.com', 'pw', FALSE, TRUE, '2026-02-22 17:17:22.552159', '2026-02-22 17:17:22.552159');
INSERT INTO users ("id", "name", "email", "password_hash", "is_verified", "is_active", "created_at", "updated_at") VALUES ('5e760daa-3670-4dd0-9b4a-5606e827de06', 'User 2', 'user2_147b@example.com', 'pw', FALSE, TRUE, '2026-02-22 17:17:22.552159', '2026-02-22 17:17:22.552159');

-- ============================================
-- Table: tools
-- ============================================
DELETE FROM tools;

INSERT INTO tools ("id", "owner_id", "name", "description", "code", "categories", "input_fields", "env_var_defs", "is_public", "created_at", "updated_at") VALUES ('362e075f-fc8b-4f9b-8397-1ed9cdc856cd', 'b0884b32-1ed5-4079-8703-ba8c7bacbaea', 'Consolidated Tool', 'Tool created with secrets in one go', 'print(''Hello '' + env.get(''API_KEY''))', '["test", "demo"]'::jsonb, '[{"name": "target_url", "type": "string", "default": "https://google.com", "required": true, "description": "URL to fetch"}]'::jsonb, '[{"name": "API_KEY", "required": true, "description": "Secret Key"}]'::jsonb, FALSE, '2026-02-17 13:31:57.787956', '2026-02-17 13:31:57.787956');
INSERT INTO tools ("id", "owner_id", "name", "description", "code", "categories", "input_fields", "env_var_defs", "is_public", "created_at", "updated_at") VALUES ('716d250e-29c7-4727-86a3-50428314ad76', '93af74dd-abcd-4e26-9d10-e579627607ca', 'Tool 0 search_me', 'Description 0', 'print(''hello'')', '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, FALSE, '2026-02-17 13:35:08.334954', '2026-02-17 13:35:08.334954');
INSERT INTO tools ("id", "owner_id", "name", "description", "code", "categories", "input_fields", "env_var_defs", "is_public", "created_at", "updated_at") VALUES ('1e49daa4-7d68-4f2d-a193-14fcb1d6fc2f', '93af74dd-abcd-4e26-9d10-e579627607ca', 'Tool 1 search_me', 'Description 1', 'print(''hello'')', '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, FALSE, '2026-02-17 13:35:08.346636', '2026-02-17 13:35:08.346636');
INSERT INTO tools ("id", "owner_id", "name", "description", "code", "categories", "input_fields", "env_var_defs", "is_public", "created_at", "updated_at") VALUES ('74296d93-a03f-49e9-b056-7c34af7309ab', '93af74dd-abcd-4e26-9d10-e579627607ca', 'Tool 2 search_me', 'Description 2', 'print(''hello'')', '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, FALSE, '2026-02-17 13:35:08.356512', '2026-02-17 13:35:08.356512');
INSERT INTO tools ("id", "owner_id", "name", "description", "code", "categories", "input_fields", "env_var_defs", "is_public", "created_at", "updated_at") VALUES ('d2ca26c8-50c2-4e57-ab6a-f31f0d46d013', '93af74dd-abcd-4e26-9d10-e579627607ca', 'Tool 3 search_me', 'Description 3', 'print(''hello'')', '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, FALSE, '2026-02-17 13:35:08.363231', '2026-02-17 13:35:08.363231');
INSERT INTO tools ("id", "owner_id", "name", "description", "code", "categories", "input_fields", "env_var_defs", "is_public", "created_at", "updated_at") VALUES ('a3957d48-e08a-4255-ba05-4a815204e1d7', '93af74dd-abcd-4e26-9d10-e579627607ca', 'Tool 4 search_me', 'Description 4', 'print(''hello'')', '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, FALSE, '2026-02-17 13:35:08.370382', '2026-02-17 13:35:08.370382');
INSERT INTO tools ("id", "owner_id", "name", "description", "code", "categories", "input_fields", "env_var_defs", "is_public", "created_at", "updated_at") VALUES ('01cc5fa2-c15e-49f6-b59d-5b892cb4e0e8', 'f3f4dafb-bd5c-42bb-bb71-ff63d0ca6324', 'Coinstats', 'Fetches details about cryptocurrencies, current price and informations.', 'import requests
from typing import Dict, Any

def execute_tool(limit: int = 10) -> Dict[str, Any]:
    """
    Execute CoinStats API coins endpoint call.
    Assumes API_KEY is in env vars via templating (e.g., {{env.API_KEY}}).
    """
    url = "https://openapiv1.coinstats.app/coins"
    headers = {"X-API-KEY": "{{env.API_KEY}}"}  # Replace or load from env
    params = {"page": 1, "limit": limit}
    
    try:
        response = requests.get(url, headers=headers, params=params, timeout=10)
        response.raise_for_status()  # Raises HTTPError for 4xx/5xx
        return response.json()
    
    except requests.exceptions.HTTPError as e:
        print(f"HTTP error: {e.response.status_code} - {e.response.text}")
        return {"error": "HTTP request failed", "status_code": e.response.status_code}
    
    except requests.exceptions.ConnectionError:
        print("Connection error: Check network or API availability.")
        return {"error": "Connection failed"}
    
    except requests.exceptions.Timeout:
        print("Request timed out.")
        return {"error": "Timeout"}
    
    except requests.exceptions.RequestException as e:
        print(f"Request error: {e}")
        return {"error": "Request failed"}
    
    except ValueError as e:
        print(f"JSON decode error: {e}")
        return {"error": "Invalid JSON response"}
    
    except Exception as e:
        print(f"Unexpected error: {e}")
        return {"error": "Unknown error"}
', '["READ"]'::jsonb, '[{"name": "limit", "type": "int", "default": "", "required": true, "description": "page limit"}]'::jsonb, '[{"name": "API_KEY", "required": true, "description": "Required environment variable"}]'::jsonb, FALSE, '2026-02-17 15:56:17.427058', '2026-02-21 08:59:31.413632');
INSERT INTO tools ("id", "owner_id", "name", "description", "code", "categories", "input_fields", "env_var_defs", "is_public", "created_at", "updated_at") VALUES ('28300cb1-698a-453e-a18e-10ba2289851f', '48ada6df-2e68-49e5-88b8-8a0a24d9d7ac', 'User 1 Tool', NULL, 'print(''secret'')', '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, FALSE, '2026-02-22 17:17:22.553833', '2026-02-22 17:17:22.553833');
INSERT INTO tools ("id", "owner_id", "name", "description", "code", "categories", "input_fields", "env_var_defs", "is_public", "created_at", "updated_at") VALUES ('0b3f71c7-8e15-4e94-bade-2d91608e79c1', 'f3f4dafb-bd5c-42bb-bb71-ff63d0ca6324', 'SendEmail', 'This tool helps in sending Email', 'import smtplib
from datetime import datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def execute_tool(recipient_email: str, subject: str, body: str) -> dict:
    try:
        sender_email = ''siddesh976@gmail.com''
        password = ''{{env.GMAIL_PWD}}''

        msg = MIMEMultipart()
        msg[''From''] = sender_email
        msg[''To''] = recipient_email
        msg[''Subject''] = subject

        html_body = f''<html><body style="font-family: Arial, sans-serif; color: #333;"><div style="max-width: 600px; margin: 0 auto; padding: 20px;"><h2>Notification</h2><p style="background-color: #f8f9fa; padding: 15px; border-radius: 5px;">{body}</p><p style="color: #999; font-size: 11px; margin-top: 20px;">Sent at: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}</p></div></body></html>''

        msg.attach(MIMEText(body, ''plain''))
        msg.attach(MIMEText(html_body, ''html''))

        # Added 20s timeout to SMTP connection
        with smtplib.SMTP(''smtp.gmail.com'', 587, timeout=20) as server:
            server.starttls()
            server.login(sender_email, password)
            server.sendmail(sender_email, recipient_email, msg.as_string())

        return {
            ''success'': True,
            ''message'': f''Email sent to {recipient_email}''
        }

    except Exception as e:
        return {
            ''success'': False,
            ''message'': f''Failed to send email: {str(e)}''
        }', '["WRITE"]'::jsonb, '[{"name": "recipient_email", "type": "str", "default": "", "required": true, "description": "Recipient email"}, {"name": "subject", "type": "str", "default": "", "required": true, "description": "Subject of the email"}, {"name": "body", "type": "str", "default": "", "required": true, "description": "Content of the email"}]'::jsonb, '[{"name": "GMAIL_PWD", "required": true, "description": "Required environment variable"}]'::jsonb, FALSE, '2026-02-21 09:09:44.016464', '2026-02-23 07:51:35.488044');

-- ============================================
-- Table: user_tool_secrets
-- ============================================
DELETE FROM user_tool_secrets;

INSERT INTO user_tool_secrets ("id", "user_id", "tool_id", "name", "encrypted_value", "created_at", "updated_at") VALUES ('9de8558c-ad89-4ff6-9fb4-2a23e45be8fd', 'b0884b32-1ed5-4079-8703-ba8c7bacbaea', '362e075f-fc8b-4f9b-8397-1ed9cdc856cd', 'API_KEY', 'gAAAAABplG3NGcJWh-wAWjYic3xyc74CE8TM0GgTKaJKRhGndeBy49spDZx-YMCGk1aDl5S6HEujqOMBkVqQJI_3e3l6RBWUTnZqkb8fOLe3LxV5lvSbp9bkNV4ZcYMs-lobtH2cysUx', '2026-02-17 13:31:57.795041', '2026-02-17 13:31:57.795041');
INSERT INTO user_tool_secrets ("id", "user_id", "tool_id", "name", "encrypted_value", "created_at", "updated_at") VALUES ('6ebd6367-c62a-4c15-801a-2a76bdd893b4', 'f3f4dafb-bd5c-42bb-bb71-ff63d0ca6324', '01cc5fa2-c15e-49f6-b59d-5b892cb4e0e8', 'API_KEY', 'gAAAAABplJffVRWB76CCKDhrUM7__kQdKW5CZ67F3Iv5RZ_r_n2_E76XFQhZOYFtuRF5-_KFcBeIQkK_Hp71DMA4qnA8-Ztk6tr1THGWA4REoXRs3G_9nH-C0TXNbCGxIYumwp-ED10x', '2026-02-17 16:14:45.722981', '2026-02-17 16:31:27.502946');
INSERT INTO user_tool_secrets ("id", "user_id", "tool_id", "name", "encrypted_value", "created_at", "updated_at") VALUES ('3f1a0b9a-93b4-46f7-9754-f3c7ed416eb5', 'f3f4dafb-bd5c-42bb-bb71-ff63d0ca6324', '0b3f71c7-8e15-4e94-bade-2d91608e79c1', 'PWD', 'gAAAAABpmXmdivSYRnRxQjQ09fDQZ4eNdMnFUVXBSss3aVyp_Ni_wvd9WdwsanFMix0VpteOBQL-F_Z-ksQ577sMZSDnm8jeFtOkPQR-ZIw-ZsLXfYK6xmg=', '2026-02-21 09:09:44.035012', '2026-02-21 09:23:41.302938');
INSERT INTO user_tool_secrets ("id", "user_id", "tool_id", "name", "encrypted_value", "created_at", "updated_at") VALUES ('2c11c7c3-f350-45e1-ad4c-846f74ac622d', 'f3f4dafb-bd5c-42bb-bb71-ff63d0ca6324', '0b3f71c7-8e15-4e94-bade-2d91608e79c1', 'GMAIL_PWD', 'gAAAAABpmXqT0VQKggxu9GqWCJ6Gkh0AXWtjnApWB-EjfTO1hOBBcJiCkURGgCFiS3vUIKfz-xthooLLdCltjktU1jF5l54xJQjttHlN3I4NG4fWsFnozfY=', '2026-02-21 09:27:47.262795', '2026-02-21 09:27:47.262795');

-- ============================================
-- Table: llms
-- ============================================
DELETE FROM llms;

INSERT INTO llms ("id", "owner_id", "name", "description", "provider", "model", "headers", "env_vars", "is_public", "created_at", "updated_at") VALUES ('eb11d56e-daa0-435c-8c6f-fec133275759', 'f3f4dafb-bd5c-42bb-bb71-ff63d0ca6324', 'Hugging face', 'Hugging_face llm', 'HuggingFace', 'CohereLabs/aya-expanse-32b:cohere', '{"Authorization": "Bearer {{env.HF_TOKEN}}"}'::jsonb, '[{"key": "HF_TOKEN", "isExisting": true}]'::jsonb, FALSE, '2026-02-17 18:13:47.877919', '2026-02-17 18:27:09.137524');
INSERT INTO llms ("id", "owner_id", "name", "description", "provider", "model", "headers", "env_vars", "is_public", "created_at", "updated_at") VALUES ('197bf867-78ae-4caf-9c3d-06a68f61e6ce', 'f3f4dafb-bd5c-42bb-bb71-ff63d0ca6324', 'Gemini', 'Gemeini', 'Gemini', 'gemini-2.5-flash', '{"x-goof-api-key": "Bearer {{env.API_KEY}}"}'::jsonb, '[{"key": "API_KEY", "isExisting": true}]'::jsonb, FALSE, '2026-02-17 18:34:36.552491', '2026-02-17 18:34:36.552491');
INSERT INTO llms ("id", "owner_id", "name", "description", "provider", "model", "headers", "env_vars", "is_public", "created_at", "updated_at") VALUES ('79604dcb-f881-4b98-83a7-e6c52de2ca99', 'df52e3d3-e15d-4da6-a1bc-77a66eb7622a', 'Test LLM', NULL, 'OpenAI', 'gpt-3.5-turbo', '{"Authorization": "Bearer sk-test-key"}'::jsonb, '[]'::jsonb, FALSE, '2026-02-19 13:17:58.800267', '2026-02-19 13:17:58.800267');
INSERT INTO llms ("id", "owner_id", "name", "description", "provider", "model", "headers", "env_vars", "is_public", "created_at", "updated_at") VALUES ('7f9d5c88-b978-4f0a-9e57-5740da0c3318', '23563c0e-71e9-4b0a-9193-334850cd2556', 'Test LLM', NULL, 'OpenAI', 'gpt-3.5-turbo', '{"Authorization": "Bearer sk-test-key"}'::jsonb, '[]'::jsonb, FALSE, '2026-02-19 13:18:19.350139', '2026-02-19 13:18:19.350139');

-- ============================================
-- Table: llm_secrets
-- ============================================
DELETE FROM llm_secrets;

INSERT INTO llm_secrets ("id", "llm_id", "name", "encrypted_value", "created_at", "updated_at") VALUES ('d4c17e2b-15db-43dc-9b47-2a2ab1ef9b13', 'eb11d56e-daa0-435c-8c6f-fec133275759', 'HF_TOKEN', 'gAAAAABplLCC2z-KGKIWVhIKU9XiT4tNcoMjSIS471W763Vi7hW0afCSLsstrZ3Fgu8bMj0CVVQOY9QoonvCqu1jhfS-ADUib_qGWf2TZezYNkkQG1JWMa13nH1GqXt9OSdhOb9pgVjD', '2026-02-17 18:13:47.877919', '2026-02-17 18:16:34.054203');
INSERT INTO llm_secrets ("id", "llm_id", "name", "encrypted_value", "created_at", "updated_at") VALUES ('3fdcd31d-3805-4a7b-b929-8f89e9065771', '197bf867-78ae-4caf-9c3d-06a68f61e6ce', 'API_KEY', 'gAAAAABplLS8nSqu6oF0Hd8vql1XnnuFfFI6WRWyLS6c3d7yL4TXSDRY1j5sWqSqC8yS0qBbDPbb2S6GYbv7Y4iGy31SlLO0q0aNs-I6kui14taX3KKtbe_4CNv_IveSBhwQuloDHm-c', '2026-02-17 18:34:36.552491', '2026-02-17 18:34:36.552491');

-- ============================================
-- Table: mcp_servers
-- ============================================
DELETE FROM mcp_servers;

INSERT INTO mcp_servers ("id", "owner_id", "name", "description", "url", "headers", "env_vars", "is_active", "created_at", "updated_at") VALUES ('a1324dd0-7047-4289-856a-ec37913a0a44', 'f3f4dafb-bd5c-42bb-bb71-ff63d0ca6324', 'github_mcp_server', NULL, 'https://api.githubcopilot.com/mcp/insiders', '{"Authorization": "Bearer {{env.MCP_KEY}}"}'::jsonb, '[{"key": "MCP_KEY", "isExisting": true}]'::jsonb, FALSE, '2026-02-18 10:26:19.052800', '2026-02-20 09:27:16.280068');
INSERT INTO mcp_servers ("id", "owner_id", "name", "description", "url", "headers", "env_vars", "is_active", "created_at", "updated_at") VALUES ('c96f14c8-5210-46b8-a6ad-98c5a843f831', 'f3f4dafb-bd5c-42bb-bb71-ff63d0ca6324', 'mongodb_mcp', NULL, 'http://localhost:3000/mcp', '{}'::jsonb, '[]'::jsonb, FALSE, '2026-02-18 13:12:56.818872', '2026-02-20 09:27:16.280068');
INSERT INTO mcp_servers ("id", "owner_id", "name", "description", "url", "headers", "env_vars", "is_active", "created_at", "updated_at") VALUES ('0e392278-7f58-46ca-84af-e94ad5011495', 'f3f4dafb-bd5c-42bb-bb71-ff63d0ca6324', 'Brave_search_mcp_server', NULL, 'http://localhost:8020/mcp', '{}'::jsonb, '[]'::jsonb, FALSE, '2026-02-18 11:25:01.712905', '2026-02-23 08:27:07.270944');

-- ============================================
-- Table: mcp_secrets
-- ============================================
DELETE FROM mcp_secrets;

INSERT INTO mcp_secrets ("id", "mcp_id", "name", "encrypted_value", "created_at", "updated_at") VALUES ('bd90f098-015d-47b6-8790-c6d75cc5301f', 'a1324dd0-7047-4289-856a-ec37913a0a44', 'MCP_KEY', 'gAAAAABplZPLcATtcavaJFkInh1QIc7cC5s2tGNGf5cW-9yiUhRNummYTqqw9HtPtxLU_IYcueiL3KVOgeTt5Lajle6Gz_6BMeY3WtBaX5xGhGFFWgMYZTXTg6RW3B75rFIwC4Esij6YfG0HTveU1ZO0N3jhj5mx7-bmwLiEPkHavZXBTYTCHQALpQK3ftX2r1RZ68yKWEJu', '2026-02-18 10:26:19.052800', '2026-02-18 10:26:19.052800');

COMMIT;

-- Export complete. 8 tables exported.