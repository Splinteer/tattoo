CREATE TABLE
    apps (
        app_id VARCHAR(64) DEFAULT 'public' NOT NULL,
        created_at_time BIGINT,
        CONSTRAINT apps_pkey PRIMARY KEY (app_id)
    );

CREATE TABLE
    tenants (
        app_id VARCHAR(64) DEFAULT 'public' NOT NULL,
        tenant_id VARCHAR(64) DEFAULT 'public' NOT NULL,
        created_at_time BIGINT,
        CONSTRAINT tenants_pkey PRIMARY KEY (app_id, tenant_id),
        CONSTRAINT tenants_app_id_fkey FOREIGN KEY (app_id) REFERENCES public.apps(app_id) ON DELETE CASCADE
    );

CREATE INDEX tenants_app_id_index ON tenants (app_id);

CREATE TABLE
    tenant_configs (
        connection_uri_domain VARCHAR(256) DEFAULT '' NOT NULL,
        app_id VARCHAR(64) DEFAULT 'public' NOT NULL,
        tenant_id VARCHAR(64) DEFAULT 'public' NOT NULL,
        core_config TEXT,
        email_password_enabled BOOLEAN,
        passwordless_enabled BOOLEAN,
        third_party_enabled BOOLEAN,
        CONSTRAINT tenant_configs_pkey PRIMARY KEY (
            connection_uri_domain,
            app_id,
            tenant_id
        )
    );

CREATE TABLE
    tenant_thirdparty_providers (
        connection_uri_domain VARCHAR(256) DEFAULT '' NOT NULL,
        app_id VARCHAR(64) DEFAULT 'public' NOT NULL,
        tenant_id VARCHAR(64) DEFAULT 'public' NOT NULL,
        third_party_id VARCHAR(28) NOT NULL,
        name VARCHAR(64),
        authorization_endpoint TEXT,
        authorization_endpoint_query_params TEXT,
        token_endpoint TEXT,
        token_endpoint_body_params TEXT,
        user_info_endpoint TEXT,
        user_info_endpoint_query_params TEXT,
        user_info_endpoint_headers TEXT,
        jwks_uri TEXT,
        oidc_discovery_endpoint TEXT,
        require_email BOOLEAN,
        user_info_map_from_id_token_payload_user_id VARCHAR(64),
        user_info_map_from_id_token_payload_email VARCHAR(64),
        user_info_map_from_id_token_payload_email_verified VARCHAR(64),
        user_info_map_from_user_info_endpoint_user_id VARCHAR(64),
        user_info_map_from_user_info_endpoint_email VARCHAR(64),
        user_info_map_from_user_info_endpoint_email_verified VARCHAR(64),
        CONSTRAINT tenant_thirdparty_providers_pkey PRIMARY KEY (
            connection_uri_domain,
            app_id,
            tenant_id,
            third_party_id
        ),
        CONSTRAINT tenant_thirdparty_providers_tenant_id_fkey FOREIGN KEY (
            connection_uri_domain,
            app_id,
            tenant_id
        ) REFERENCES public.tenant_configs(
            connection_uri_domain,
            app_id,
            tenant_id
        ) ON DELETE CASCADE
    );

CREATE INDEX
    tenant_thirdparty_providers_tenant_id_index ON tenant_thirdparty_providers (
        connection_uri_domain,
        app_id,
        tenant_id
    );

CREATE TABLE
    tenant_thirdparty_provider_clients (
        connection_uri_domain VARCHAR(256) DEFAULT '' NOT NULL,
        app_id VARCHAR(64) DEFAULT 'public' NOT NULL,
        tenant_id VARCHAR(64) DEFAULT 'public' NOT NULL,
        third_party_id VARCHAR(28) NOT NULL,
        client_type VARCHAR(64) DEFAULT '' NOT NULL,
        client_id VARCHAR(256) NOT NULL,
        client_secret TEXT,
        scope VARCHAR(128) [],
        force_pkce BOOLEAN,
        additional_config TEXT,
        CONSTRAINT tenant_thirdparty_provider_clients_pkey PRIMARY KEY (
            connection_uri_domain,
            app_id,
            tenant_id,
            third_party_id,
            client_type
        ),
        CONSTRAINT tenant_thirdparty_provider_clients_third_party_id_fkey FOREIGN KEY (
            connection_uri_domain,
            app_id,
            tenant_id,
            third_party_id
        ) REFERENCES public.tenant_thirdparty_providers(
            connection_uri_domain,
            app_id,
            tenant_id,
            third_party_id
        ) ON DELETE CASCADE
    );

CREATE INDEX
    tenant_thirdparty_provider_clients_third_party_id_index ON tenant_thirdparty_provider_clients (
        connection_uri_domain,
        app_id,
        tenant_id,
        third_party_id
    );

CREATE TABLE
    key_value (
        app_id VARCHAR(64) DEFAULT 'public' NOT NULL,
        tenant_id VARCHAR(64) DEFAULT 'public' NOT NULL,
        name VARCHAR(128) NOT NULL,
        value TEXT,
        created_at_time BIGINT,
        CONSTRAINT key_value_pkey PRIMARY KEY (app_id, tenant_id, name),
        CONSTRAINT key_value_tenant_id_fkey FOREIGN KEY (app_id, tenant_id) REFERENCES public.tenants(app_id, tenant_id) ON DELETE CASCADE
    );

CREATE INDEX
    key_value_tenant_id_index ON key_value (app_id, tenant_id);

CREATE TABLE
    app_id_to_user_id (
        app_id VARCHAR(64) DEFAULT 'public' NOT NULL,
        user_id character(36) NOT NULL,
        recipe_id VARCHAR(128) NOT NULL,
        CONSTRAINT app_id_to_user_id_pkey PRIMARY KEY (app_id, user_id),
        CONSTRAINT app_id_to_user_id_app_id_fkey FOREIGN KEY (app_id) REFERENCES public.apps(app_id) ON DELETE CASCADE
    );

CREATE INDEX
    app_id_to_user_id_app_id_index ON app_id_to_user_id (app_id);

CREATE TABLE
    all_auth_recipe_users (
        app_id VARCHAR(64) DEFAULT 'public' NOT NULL,
        tenant_id VARCHAR(64) DEFAULT 'public' NOT NULL,
        user_id character(36) NOT NULL,
        recipe_id VARCHAR(128) NOT NULL,
        time_joined BIGINT NOT NULL,
        CONSTRAINT all_auth_recipe_users_pkey PRIMARY KEY (app_id, tenant_id, user_id),
        CONSTRAINT all_auth_recipe_users_tenant_id_fkey FOREIGN KEY (app_id, tenant_id) REFERENCES public.tenants(app_id, tenant_id) ON DELETE CASCADE,
        CONSTRAINT all_auth_recipe_users_user_id_fkey FOREIGN KEY (app_id, user_id) REFERENCES public.app_id_to_user_id(app_id, user_id) ON DELETE CASCADE
    );

CREATE INDEX
    all_auth_recipe_users_pagination_index ON all_auth_recipe_users (
        time_joined DESC,
        user_id DESC,
        tenant_id DESC,
        app_id DESC
    );

CREATE INDEX
    all_auth_recipe_user_id_index ON all_auth_recipe_users (app_id, user_id);

CREATE INDEX
    all_auth_recipe_tenant_id_index ON all_auth_recipe_users (app_id, tenant_id);

CREATE TABLE
    userid_mapping (
        app_id VARCHAR(64) DEFAULT 'public' NOT NULL,
        supertokens_user_id character(36) NOT NULL,
        external_user_id VARCHAR(128) NOT NULL,
        external_user_id_info TEXT,
        CONSTRAINT userid_mapping_external_user_id_key UNIQUE (app_id, external_user_id),
        CONSTRAINT userid_mapping_pkey PRIMARY KEY (
            app_id,
            supertokens_user_id,
            external_user_id
        ),
        CONSTRAINT userid_mapping_supertokens_user_id_key UNIQUE (app_id, supertokens_user_id),
        CONSTRAINT userid_mapping_supertokens_user_id_fkey FOREIGN KEY (app_id, supertokens_user_id) REFERENCES public.app_id_to_user_id(app_id, user_id) ON DELETE CASCADE
    );

CREATE INDEX
    userid_mapping_supertokens_user_id_index ON userid_mapping (app_id, supertokens_user_id);

CREATE TABLE
    dashboard_users (
        app_id VARCHAR(64) DEFAULT 'public' NOT NULL,
        user_id character(36) NOT NULL,
        email VARCHAR(256) NOT NULL,
        password_hash VARCHAR(256) NOT NULL,
        time_joined BIGINT NOT NULL,
        CONSTRAINT dashboard_users_email_key UNIQUE (app_id, email),
        CONSTRAINT dashboard_users_pkey PRIMARY KEY (app_id, user_id),
        CONSTRAINT dashboard_users_app_id_fkey FOREIGN KEY (app_id) REFERENCES public.apps(app_id) ON DELETE CASCADE
    );

CREATE INDEX
    dashboard_users_app_id_index ON dashboard_users (app_id);

CREATE TABLE
    dashboard_user_sessions (
        app_id VARCHAR(64) DEFAULT 'public' NOT NULL,
        session_id character(36) NOT NULL,
        user_id character(36) NOT NULL,
        time_created BIGINT NOT NULL,
        expiry BIGINT NOT NULL,
        CONSTRAINT dashboard_user_sessions_pkey PRIMARY KEY (app_id, session_id),
        CONSTRAINT dashboard_user_sessions_user_id_fkey FOREIGN KEY (app_id, user_id) REFERENCES public.dashboard_users(app_id, user_id) ON UPDATE CASCADE ON DELETE CASCADE
    );

CREATE INDEX
    dashboard_user_sessions_expiry_index ON dashboard_user_sessions (expiry);

CREATE INDEX
    dashboard_user_sessions_user_id_index ON dashboard_user_sessions (app_id, user_id);

CREATE TABLE
    session_access_token_signing_keys (
        app_id VARCHAR(64) DEFAULT 'public' NOT NULL,
        created_at_time BIGINT NOT NULL,
        value TEXT,
        CONSTRAINT session_access_token_signing_keys_pkey PRIMARY KEY (app_id, created_at_time),
        CONSTRAINT session_access_token_signing_keys_app_id_fkey FOREIGN KEY (app_id) REFERENCES public.apps(app_id) ON DELETE CASCADE
    );

CREATE INDEX
    access_token_signing_keys_app_id_index ON session_access_token_signing_keys (app_id);

CREATE TABLE
    session_info (
        app_id VARCHAR(64) DEFAULT 'public' NOT NULL,
        tenant_id VARCHAR(64) DEFAULT 'public' NOT NULL,
        session_handle VARCHAR(255) NOT NULL,
        user_id VARCHAR(128) NOT NULL,
        refresh_token_hash_2 VARCHAR(128) NOT NULL,
        session_data TEXT,
        expires_at BIGINT NOT NULL,
        created_at_time BIGINT NOT NULL,
        jwt_user_payload TEXT,
        use_static_key BOOLEAN NOT NULL,
        CONSTRAINT session_info_pkey PRIMARY KEY (
            app_id,
            tenant_id,
            session_handle
        ),
        CONSTRAINT session_info_tenant_id_fkey FOREIGN KEY (app_id, tenant_id) REFERENCES public.tenants(app_id, tenant_id) ON DELETE CASCADE
    );

CREATE INDEX session_expiry_index ON session_info (expires_at);

CREATE INDEX
    session_info_tenant_id_index ON session_info (app_id, tenant_id);

CREATE TABLE
    user_last_active (
        app_id VARCHAR(64) DEFAULT 'public' NOT NULL,
        user_id VARCHAR(128) NOT NULL,
        last_active_time BIGINT,
        CONSTRAINT user_last_active_pkey PRIMARY KEY (app_id, user_id),
        CONSTRAINT user_last_active_app_id_fkey FOREIGN KEY (app_id) REFERENCES public.apps(app_id) ON DELETE CASCADE
    );

CREATE INDEX
    user_last_active_app_id_index ON user_last_active (app_id);

CREATE TABLE
    emailpassword_users (
        app_id VARCHAR(64) DEFAULT 'public' NOT NULL,
        user_id character(36) NOT NULL,
        email VARCHAR(256) NOT NULL,
        password_hash VARCHAR(256) NOT NULL,
        time_joined BIGINT NOT NULL,
        CONSTRAINT emailpassword_users_pkey PRIMARY KEY (app_id, user_id),
        CONSTRAINT emailpassword_users_user_id_fkey FOREIGN KEY (app_id, user_id) REFERENCES public.app_id_to_user_id(app_id, user_id) ON DELETE CASCADE
    );

CREATE TABLE
    emailpassword_user_to_tenant (
        app_id VARCHAR(64) DEFAULT 'public' NOT NULL,
        tenant_id VARCHAR(64) DEFAULT 'public' NOT NULL,
        user_id character(36) NOT NULL,
        email VARCHAR(256) NOT NULL,
        CONSTRAINT emailpassword_user_to_tenant_email_key UNIQUE (app_id, tenant_id, email),
        CONSTRAINT emailpassword_user_to_tenant_pkey PRIMARY KEY (app_id, tenant_id, user_id),
        CONSTRAINT emailpassword_user_to_tenant_user_id_fkey FOREIGN KEY (app_id, tenant_id, user_id) REFERENCES public.all_auth_recipe_users(app_id, tenant_id, user_id) ON DELETE CASCADE
    );

CREATE TABLE
    emailpassword_pswd_reset_tokens (
        app_id VARCHAR(64) DEFAULT 'public' NOT NULL,
        user_id character(36) NOT NULL,
        token VARCHAR(128) NOT NULL,
        token_expiry BIGINT NOT NULL,
        CONSTRAINT emailpassword_pswd_reset_tokens_pkey PRIMARY KEY (app_id, user_id, token),
        CONSTRAINT emailpassword_pswd_reset_tokens_token_key UNIQUE (token),
        CONSTRAINT emailpassword_pswd_reset_tokens_user_id_fkey FOREIGN KEY (app_id, user_id) REFERENCES public.emailpassword_users(app_id, user_id) ON UPDATE CASCADE ON DELETE CASCADE
    );

CREATE INDEX
    emailpassword_password_reset_token_expiry_index ON emailpassword_pswd_reset_tokens (token_expiry);

CREATE INDEX
    emailpassword_pswd_reset_tokens_user_id_index ON emailpassword_pswd_reset_tokens (app_id, user_id);

CREATE TABLE
    emailverification_verified_emails (
        app_id VARCHAR(64) DEFAULT 'public' NOT NULL,
        user_id VARCHAR(128) NOT NULL,
        email VARCHAR(256) NOT NULL,
        CONSTRAINT emailverification_verified_emails_pkey PRIMARY KEY (app_id, user_id, email),
        CONSTRAINT emailverification_verified_emails_app_id_fkey FOREIGN KEY (app_id) REFERENCES public.apps(app_id) ON DELETE CASCADE
    );

CREATE INDEX
    emailverification_verified_emails_app_id_index ON emailverification_verified_emails (app_id);

CREATE TABLE
    emailverification_tokens (
        app_id VARCHAR(64) DEFAULT 'public' NOT NULL,
        tenant_id VARCHAR(64) DEFAULT 'public' NOT NULL,
        user_id VARCHAR(128) NOT NULL,
        email VARCHAR(256) NOT NULL,
        token VARCHAR(128) NOT NULL,
        token_expiry BIGINT NOT NULL,
        CONSTRAINT emailverification_tokens_pkey PRIMARY KEY (
            app_id,
            tenant_id,
            user_id,
            email,
            token
        ),
        CONSTRAINT emailverification_tokens_token_key UNIQUE (token),
        CONSTRAINT emailverification_tokens_tenant_id_fkey FOREIGN KEY (app_id, tenant_id) REFERENCES public.tenants(app_id, tenant_id) ON DELETE CASCADE
    );

CREATE INDEX
    emailverification_tokens_index ON emailverification_tokens (token_expiry);

CREATE INDEX
    emailverification_tokens_tenant_id_index ON emailverification_tokens (app_id, tenant_id);

CREATE TABLE
    thirdparty_users (
        app_id VARCHAR(64) DEFAULT 'public' NOT NULL,
        third_party_id VARCHAR(28) NOT NULL,
        third_party_user_id VARCHAR(256) NOT NULL,
        user_id character(36) NOT NULL,
        email VARCHAR(256) NOT NULL,
        time_joined BIGINT NOT NULL,
        CONSTRAINT thirdparty_users_pkey PRIMARY KEY (app_id, user_id),
        CONSTRAINT thirdparty_users_user_id_fkey FOREIGN KEY (app_id, user_id) REFERENCES public.app_id_to_user_id(app_id, user_id) ON DELETE CASCADE
    );

CREATE INDEX
    thirdparty_users_email_index ON thirdparty_users (app_id, email);

CREATE INDEX
    thirdparty_users_thirdparty_user_id_index ON thirdparty_users (
        app_id,
        third_party_id,
        third_party_user_id
    );

CREATE TABLE
    thirdparty_user_to_tenant (
        app_id VARCHAR(64) DEFAULT 'public' NOT NULL,
        tenant_id VARCHAR(64) DEFAULT 'public' NOT NULL,
        user_id character(36) NOT NULL,
        third_party_id VARCHAR(28) NOT NULL,
        third_party_user_id VARCHAR(256) NOT NULL,
        CONSTRAINT thirdparty_user_to_tenant_pkey PRIMARY KEY (app_id, tenant_id, user_id),
        CONSTRAINT thirdparty_user_to_tenant_third_party_user_id_key UNIQUE (
            app_id,
            tenant_id,
            third_party_id,
            third_party_user_id
        ),
        CONSTRAINT thirdparty_user_to_tenant_user_id_fkey FOREIGN KEY (app_id, tenant_id, user_id) REFERENCES public.all_auth_recipe_users(app_id, tenant_id, user_id) ON DELETE CASCADE
    );

CREATE TABLE
    passwordless_users (
        app_id VARCHAR(64) DEFAULT 'public' NOT NULL,
        user_id character(36) NOT NULL,
        email VARCHAR(256),
        phone_number VARCHAR(256),
        time_joined BIGINT NOT NULL,
        CONSTRAINT passwordless_users_pkey PRIMARY KEY (app_id, user_id),
        CONSTRAINT passwordless_users_user_id_fkey FOREIGN KEY (app_id, user_id) REFERENCES public.app_id_to_user_id(app_id, user_id) ON DELETE CASCADE
    );

CREATE TABLE
    passwordless_user_to_tenant (
        app_id VARCHAR(64) DEFAULT 'public' NOT NULL,
        tenant_id VARCHAR(64) DEFAULT 'public' NOT NULL,
        user_id character(36) NOT NULL,
        email VARCHAR(256),
        phone_number VARCHAR(256),
        CONSTRAINT passwordless_user_to_tenant_email_key UNIQUE (app_id, tenant_id, email),
        CONSTRAINT passwordless_user_to_tenant_phone_number_key UNIQUE (
            app_id,
            tenant_id,
            phone_number
        ),
        CONSTRAINT passwordless_user_to_tenant_pkey PRIMARY KEY (app_id, tenant_id, user_id),
        CONSTRAINT passwordless_user_to_tenant_user_id_fkey FOREIGN KEY (app_id, tenant_id, user_id) REFERENCES public.all_auth_recipe_users(app_id, tenant_id, user_id) ON DELETE CASCADE
    );

CREATE TABLE
    passwordless_devices (
        app_id VARCHAR(64) DEFAULT 'public' NOT NULL,
        tenant_id VARCHAR(64) DEFAULT 'public' NOT NULL,
        device_id_hash character(44) NOT NULL,
        email VARCHAR(256),
        phone_number VARCHAR(256),
        link_code_salt character(44) NOT NULL,
        failed_attempts integer NOT NULL,
        CONSTRAINT passwordless_devices_pkey PRIMARY KEY (
            app_id,
            tenant_id,
            device_id_hash
        ),
        CONSTRAINT passwordless_devices_tenant_id_fkey FOREIGN KEY (app_id, tenant_id) REFERENCES public.tenants(app_id, tenant_id) ON DELETE CASCADE
    );

CREATE INDEX
    passwordless_devices_email_index ON passwordless_devices (app_id, tenant_id, email);

CREATE INDEX
    passwordless_devices_phone_number_index ON passwordless_devices (
        app_id,
        tenant_id,
        phone_number
    );

CREATE INDEX
    passwordless_devices_tenant_id_index ON passwordless_devices (app_id, tenant_id);

CREATE TABLE
    passwordless_codes (
        app_id VARCHAR(64) DEFAULT 'public' NOT NULL,
        tenant_id VARCHAR(64) DEFAULT 'public' NOT NULL,
        code_id character(36) NOT NULL,
        device_id_hash character(44) NOT NULL,
        link_code_hash character(44) NOT NULL,
        created_at BIGINT NOT NULL,
        CONSTRAINT passwordless_codes_link_code_hash_key UNIQUE (
            app_id,
            tenant_id,
            link_code_hash
        ),
        CONSTRAINT passwordless_codes_pkey PRIMARY KEY (app_id, tenant_id, code_id),
        CONSTRAINT passwordless_codes_device_id_hash_fkey FOREIGN KEY (
            app_id,
            tenant_id,
            device_id_hash
        ) REFERENCES public.passwordless_devices(
            app_id,
            tenant_id,
            device_id_hash
        ) ON UPDATE CASCADE ON DELETE CASCADE
    );

CREATE INDEX
    passwordless_codes_created_at_index ON passwordless_codes (app_id, tenant_id, created_at);

CREATE INDEX
    passwordless_codes_device_id_hash_index ON passwordless_codes (
        app_id,
        tenant_id,
        device_id_hash
    );

CREATE TABLE
    jwt_signing_keys (
        app_id VARCHAR(64) DEFAULT 'public' NOT NULL,
        key_id VARCHAR(255) NOT NULL,
        key_string TEXT NOT NULL,
        algorithm VARCHAR(10) NOT NULL,
        created_at BIGINT,
        CONSTRAINT jwt_signing_keys_pkey PRIMARY KEY (app_id, key_id),
        CONSTRAINT jwt_signing_keys_app_id_fkey FOREIGN KEY (app_id) REFERENCES public.apps(app_id) ON DELETE CASCADE
    );

CREATE INDEX
    jwt_signing_keys_app_id_index ON jwt_signing_keys (app_id);

CREATE TABLE
    user_metadata (
        app_id VARCHAR(64) DEFAULT 'public' NOT NULL,
        user_id VARCHAR(128) NOT NULL,
        user_metadata TEXT NOT NULL,
        CONSTRAINT user_metadata_pkey PRIMARY KEY (app_id, user_id),
        CONSTRAINT user_metadata_app_id_fkey FOREIGN KEY (app_id) REFERENCES public.apps(app_id) ON DELETE CASCADE
    );

CREATE INDEX user_metadata_app_id_index ON user_metadata (app_id);

CREATE TABLE
    roles (
        app_id VARCHAR(64) DEFAULT 'public' NOT NULL,
        role VARCHAR(255) NOT NULL,
        CONSTRAINT roles_pkey PRIMARY KEY (app_id, role),
        CONSTRAINT roles_app_id_fkey FOREIGN KEY (app_id) REFERENCES public.apps(app_id) ON DELETE CASCADE
    );

CREATE INDEX roles_app_id_index ON roles (app_id);

CREATE TABLE
    role_permissions (
        app_id VARCHAR(64) DEFAULT 'public' NOT NULL,
        role VARCHAR(255) NOT NULL,
        permission VARCHAR(255) NOT NULL,
        CONSTRAINT role_permissions_pkey PRIMARY KEY (app_id, role, permission),
        CONSTRAINT role_permissions_role_fkey FOREIGN KEY (app_id, role) REFERENCES public.roles(app_id, role) ON DELETE CASCADE
    );

CREATE INDEX
    role_permissions_permission_index ON role_permissions (app_id, permission);

CREATE INDEX
    role_permissions_role_index ON role_permissions (app_id, role);

CREATE TABLE
    user_roles (
        app_id VARCHAR(64) DEFAULT 'public' NOT NULL,
        tenant_id VARCHAR(64) DEFAULT 'public' NOT NULL,
        user_id VARCHAR(128) NOT NULL,
        role VARCHAR(255) NOT NULL,
        CONSTRAINT user_roles_pkey PRIMARY KEY (
            app_id,
            tenant_id,
            user_id,
            role
        ),
        CONSTRAINT user_roles_role_fkey FOREIGN KEY (app_id, role) REFERENCES public.roles(app_id, role) ON DELETE CASCADE,
        CONSTRAINT user_roles_tenant_id_fkey FOREIGN KEY (app_id, tenant_id) REFERENCES public.tenants(app_id, tenant_id) ON DELETE CASCADE
    );

CREATE INDEX
    user_roles_role_index ON user_roles (app_id, tenant_id, role);

CREATE INDEX
    user_roles_tenant_id_index ON user_roles (app_id, tenant_id);

CREATE INDEX
    user_roles_app_id_role_index ON user_roles (app_id, role);

CREATE TABLE
    totp_users (
        app_id VARCHAR(64) DEFAULT 'public' NOT NULL,
        user_id VARCHAR(128) NOT NULL,
        CONSTRAINT totp_users_pkey PRIMARY KEY (app_id, user_id),
        CONSTRAINT totp_users_app_id_fkey FOREIGN KEY (app_id) REFERENCES public.apps(app_id) ON DELETE CASCADE
    );

CREATE INDEX totp_users_app_id_index ON totp_users (app_id);

CREATE TABLE
    totp_user_devices (
        app_id VARCHAR(64) DEFAULT 'public' NOT NULL,
        user_id VARCHAR(128) NOT NULL,
        device_name VARCHAR(256) NOT NULL,
        secret_key VARCHAR(256) NOT NULL,
        period integer NOT NULL,
        skew integer NOT NULL,
        verified BOOLEAN NOT NULL,
        CONSTRAINT totp_user_devices_pkey PRIMARY KEY (app_id, user_id, device_name),
        CONSTRAINT totp_user_devices_user_id_fkey FOREIGN KEY (app_id, user_id) REFERENCES public.totp_users(app_id, user_id) ON DELETE CASCADE
    );

CREATE INDEX
    totp_user_devices_user_id_index ON totp_user_devices (app_id, user_id);

CREATE TABLE
    totp_used_codes (
        app_id VARCHAR(64) DEFAULT 'public' NOT NULL,
        tenant_id VARCHAR(64) DEFAULT 'public' NOT NULL,
        user_id VARCHAR(128) NOT NULL,
        code VARCHAR(8) NOT NULL,
        is_valid BOOLEAN NOT NULL,
        expiry_time_ms BIGINT NOT NULL,
        created_time_ms BIGINT NOT NULL,
        CONSTRAINT totp_used_codes_pkey PRIMARY KEY (
            app_id,
            tenant_id,
            user_id,
            created_time_ms
        ),
        CONSTRAINT totp_used_codes_tenant_id_fkey FOREIGN KEY (app_id, tenant_id) REFERENCES public.tenants(app_id, tenant_id) ON DELETE CASCADE,
        CONSTRAINT totp_used_codes_user_id_fkey FOREIGN KEY (app_id, user_id) REFERENCES public.totp_users(app_id, user_id) ON DELETE CASCADE
    );

CREATE INDEX
    totp_used_codes_expiry_time_ms_index ON totp_used_codes (
        app_id,
        tenant_id,
        expiry_time_ms
    );

CREATE INDEX
    totp_used_codes_tenant_id_index ON totp_used_codes (app_id, tenant_id);

CREATE INDEX
    totp_used_codes_user_id_index ON totp_used_codes (app_id, user_id);
