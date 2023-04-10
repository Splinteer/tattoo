CREATE TABLE
    public.customer (
        id uuid PRIMARY KEY NOT NULL,
        supertokens_id uuid NOT NULL UNIQUE,
        email varchar(255) NOT NULL,
        firstname varchar(255) NOT NULL,
        lastname varchar(255) NOT NULL,
        birthday date NOT NULL
    );

CREATE TABLE
    public.shop (
        id uuid PRIMARY KEY NOT NULL,
        owner_id uuid NOT NULL,
        name varchar(255) NOT NULL,
        url varchar(255) NOT NULL,
        show_city boolean DEFAULT TRUE,
        vacation_mode boolean DEFAULT FALSE,
        CONSTRAINT fk_shop_owner FOREIGN KEY(owner_id) REFERENCES public.customer(id)
    );

CREATE TABLE
    public.address (
        id uuid PRIMARY KEY NOT NULL,
        shop_id uuid,
        address varchar(255) NOT NULL,
        address2 varchar(255),
        city varchar(255) NOT NULL,
        postalcode varchar(255) NOT NULL,
        state varchar(255),
        country varchar(255) NOT NULL,
        CONSTRAINT fk_address_shop FOREIGN KEY(shop_id) REFERENCES public.shop(id)
    );

CREATE TYPE member_type AS ENUM ('tattoo_artist', 'manager');

CREATE TABLE
    public.member (
        shop_id uuid NOT NULL,
        customer_id uuid NOT NULL,
        type member_type NOT NULL,
        can_read_message boolean DEFAULT FALSE,
        can_write_message boolean DEFAULT FALSE,
        PRIMARY KEY(shop_id, customer_id),
        CONSTRAINT fk_member_shop FOREIGN KEY(shop_id) REFERENCES public.shop(id),
        CONSTRAINT fk_member_customer FOREIGN KEY(customer_id) REFERENCES public.customer(id)
    );
