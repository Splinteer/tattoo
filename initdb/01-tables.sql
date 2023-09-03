CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE
    IF NOT EXISTS public.customer (
        id uuid PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
        supertokens_id uuid NOT NULL UNIQUE,
        creation_date timestamp NOT NULL DEFAULT NOW(),
        last_update timestamp NOT NULL DEFAULT NOW(),
        email varchar(255) NOT NULL,
        firstname varchar(255),
        lastname varchar(255),
        birthday date,
        got_profile_picture boolean NOT NULL DEFAULT false,
        profile_picture_version integer NOT NULL DEFAULT 0,
        pronouns varchar(255),
        phone varchar(255),
        instagram varchar(255),
        twitter varchar(255),
        personal_information text,
        address varchar(255),
        address2 varchar(255),
        city varchar(255),
        zipcode varchar(255)
    );

CREATE TABLE
    IF NOT EXISTS public.shop (
        id uuid PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
        owner_id uuid NOT NULL UNIQUE,
        creation_date timestamp NOT NULL DEFAULT NOW(),
        last_update timestamp NOT NULL DEFAULT NOW(),
        name varchar(255) NOT NULL,
        url varchar(255) NOT NULL,
        description text,
        booking_condition text DEFAULT '',
        got_profile_picture boolean NOT NULL DEFAULT false,
        profile_picture_version integer NOT NULL DEFAULT 0,
        instagram varchar(255),
        twitter varchar(255),
        facebook varchar(255),
        website varchar(255),
        auto_generate_availability boolean NOT NULL DEFAULT false,
        repeat_availability_every integer NOT NULL DEFAULT 1,
        repeat_availability_time_unit varchar(10) NOT NULL DEFAULT 'month',
        min_appointment_time integer NOT NULL DEFAULT 60,
        CONSTRAINT fk_owner_id FOREIGN KEY (owner_id) REFERENCES public.customer (id)
    );

-- TODO use this table instead

CREATE TABLE
    IF NOT EXISTS public.address(
        id uuid PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
        shop_id uuid NOT NULL,
        creation_date timestamp NOT NULL DEFAULT NOW(),
        last_update timestamp NOT NULL DEFAULT NOW(),
        address_line_1 varchar(255) NOT NULL,
        address_line_2 varchar(255),
        state varchar(255) NOT NULL,
        city varchar(255) NOT NULL,
        zip_code varchar(255) NOT NULL,
        country varchar(255) NOT NULL,
        CONSTRAINT fk_shop_id FOREIGN KEY (shop_id) REFERENCES public.shop (id)
    );

CREATE TABLE
    IF NOT EXISTS public.flash (
        id uuid PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
        shop_id uuid NOT NULL,
        creation_date timestamp NOT NULL DEFAULT NOW(),
        name varchar(255) NOT NULL,
        description text,
        image_url varchar(255) NOT NULL,
        image_version integer NOT NULL DEFAULT 0,
        available boolean NOT NULL DEFAULT true,
        price_range_start integer,
        price_range_end integer,
        CONSTRAINT fk_shop_id FOREIGN KEY (shop_id) REFERENCES public.shop (id)
    );

CREATE TABLE
    IF NOT EXISTS public.default_availability (
        id uuid PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
        shop_id uuid NOT NULL,
        start_day integer NOT NULL,
        end_day integer NOT NULL,
        start_time time NOT NULL,
        end_time time NOT NULL,
        CONSTRAINT fk_shop_id FOREIGN KEY (shop_id) REFERENCES public.shop (id)
    );

CREATE TABLE
    IF NOT EXISTS public.availability (
        id uuid PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
        shop_id uuid NOT NULL,
        start_date_time timestamp NOT NULL,
        end_date_time timestamp NOT NULL,
        automatic boolean NOT NULL DEFAULT TRUE,
        CONSTRAINT fk_shop_id FOREIGN KEY (shop_id) REFERENCES public.shop (id)
    );

CREATE TABLE
    IF NOT EXISTS public.unavailability (
        id uuid PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
        shop_id uuid NOT NULL,
        start_date_time timestamp NOT NULL,
        end_date_time timestamp NOT NULL,
        CONSTRAINT fk_shop_id_unavail FOREIGN KEY (shop_id) REFERENCES public.shop (id)
    );

CREATE TYPE
    public.project_type AS ENUM (
        'flashs',
        'custom',
        'adjustment'
    );

CREATE TABLE
    IF NOT EXISTS public.project (
        id uuid PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
        customer_id uuid NOT NULL,
        shop_id uuid NOT NULL,
        name varchar(255) NOT NULL,
        types project_type [] NOT NULL,
        is_first_tattoo boolean NOT NULL,
        is_cover_up boolean NOT NULL,
        is_post_operation_or_over_scar boolean NOT NULL,
        zone varchar(255) NOT NULL,
        height_cm integer NOT NULL,
        width_cm integer NOT NULL,
        additional_information text,
        is_drawing_done boolean NOT NULL DEFAULT false,
        is_drawing_approved boolean NOT NULL DEFAULT false,
        is_paid boolean NOT NULL DEFAULT false,
        customer_rating integer,
        shop_rating integer,
        CONSTRAINT fk_customer_id FOREIGN KEY (customer_id) REFERENCES public.customer (id),
        CONSTRAINT fk_shop_id FOREIGN KEY (shop_id) REFERENCES public.shop (id)
    );

CREATE TABLE
    IF NOT EXISTS public.project_flash(
        project_id uuid NOT NULL,
        flash_id uuid NOT NULL,
        PRIMARY KEY (project_id, flash_id),
        CONSTRAINT fk_project_id FOREIGN KEY (project_id) REFERENCES public.project (id),
        CONSTRAINT fk_flash_id FOREIGN KEY (flash_id) REFERENCES public.flash (id)
    );

CREATE TYPE
    public.project_attachment_type AS ENUM ('illustration', 'location');

CREATE TABLE
    IF NOT EXISTS public.project_attachment(
        project_id uuid NOT NULL,
        image_url varchar(255) NOT NULL,
        type project_attachment_type NOT NULL,
        PRIMARY KEY (project_id, image_url),
        CONSTRAINT fk_project_id FOREIGN KEY (project_id) REFERENCES public.project (id)
    );

CREATE TABLE
    IF NOT EXISTS public.bill (
        project_id uuid NOT NULL,
        customer_id uuid NOT NULL,
        firstname varchar(255) NOT NULL,
        lastname varchar(255) NOT NULL,
        address varchar(255) NOT NULL,
        address2 varchar(255),
        city varchar(255) NOT NULL,
        zipcode varchar(255) NOT NULL,
        PRIMARY KEY (project_id, customer_id),
        CONSTRAINT fk_project_id FOREIGN KEY (project_id) REFERENCES public.project (id),
        CONSTRAINT fk_customer_id FOREIGN KEY (customer_id) REFERENCES public.customer (id)
    );

CREATE TABLE
    IF NOT EXISTS public.appointment(
        id uuid PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
        project_id uuid NOT NULL,
        creation_date timestamp NOT NULL DEFAULT NOW(),
        start_date timestamp NOT NULL,
        end_date timestamp,
        is_confirmed boolean NOT NULL DEFAULT false,
        CONSTRAINT fk_project_id FOREIGN KEY (project_id) REFERENCES public.project (id)
    );

CREATE TABLE
    IF NOT EXISTS public.chat(
        id uuid PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
        project_id uuid NOT NULL,
        creation_date timestamp NOT NULL DEFAULT NOW(),
        CONSTRAINT fk_project_id FOREIGN KEY (project_id) REFERENCES public.project (id)
    );

CREATE TABLE
    IF NOT EXISTS public.message (
        id uuid PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
        chat_id uuid NOT NULL,
        creation_date timestamp NOT NULL DEFAULT NOW(),
        sender_id uuid NOT NULL,
        content text NOT NULL,
        is_read boolean NOT NULL DEFAULT false,
        CONSTRAINT fk_chat_id FOREIGN KEY (chat_id) REFERENCES public.chat (id),
        CONSTRAINT fk_sender_id FOREIGN KEY (sender_id) REFERENCES public.customer (id)
    );

CREATE TABLE
    IF NOT EXISTS public.message_attachment(
        message_id uuid NOT NULL,
        image_url varchar(255) NOT NULL,
        PRIMARY KEY (message_id, image_url),
        CONSTRAINT fk_message_id FOREIGN KEY (message_id) REFERENCES public.message (id)
    );

CREATE TABLE
    IF NOT EXISTS public.gallery (
        id uuid PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
        shop_id uuid NOT NULL,
        image_url varchar(255) NOT NULL,
        image_version integer NOT NULL DEFAULT 0,
        project_id uuid,
        creation_date timestamp NOT NULL DEFAULT NOW(),
        name varchar(255) NOT NULL,
        description text,
        CONSTRAINT fk_shop_id FOREIGN KEY (shop_id) REFERENCES public.shop (id),
        CONSTRAINT fk_project_id FOREIGN KEY (project_id) REFERENCES public.project (id)
    );
