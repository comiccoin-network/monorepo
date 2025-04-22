# ⚖️ ComicCoin Blockchain Authority

The **⚖️ ComicCoin Blockchain Authority** is a central server implementing the "Proof of Authority" consensus mechanism for all connected nodes. This repository provides the necessary code and instructions to set up and run the authority.

## 📖 Installation

### Step 1: Set Up Your Go Environment

1. Navigate to your Go workspace and create a new directory for the ComicCoin Network:

    ```bash
    cd ~/go/src/github.com/
    mkdir comiccoin-network
    cd comiccoin-network
    ```

2. Clone the monorepo into the newly created directory:

    ```bash
    git clone git@github.com:comiccoin-network/monorepo.git
    ```

## ⚙️ Project Setup

### Part 1: Set Up Environment Variables

1. Copy the sample environment file:

    ```bash
    cp .env.sample .env
    ```

2. Fill in the environment variables in the `.env` file. **Note:** The following variables will be configured later and should be skipped for now:

   - `COMICCOIN_AUTHORITY_APP_ADMINISTRATION_HMAC_SECRET`
   - `COMICCOIN_AUTHORITY_APP_ADMINISTRATION_SECRET_KEY`
   - `COMICCOIN_AUTHORITY_APP_ADMINISTRATION_API_KEY`
   - `COMICCOIN_AUTHORITY_APP_GEOLITE_DB_PATH`
   - `COMICCOIN_AUTHORITY_APP_BANNED_COUNTRIES`
   - `COMICCOIN_AUTHORITY_BLOCKCHAIN_PROOF_OF_AUTHORITY_ACCOUNT_ADDRESS`
   - `COMICCOIN_AUTHORITY_BLOCKCHAIN_PROOF_OF_AUTHORITY_WALLET_MNEMONIC`
   - `COMICCOIN_AUTHORITY_BLOCKCHAIN_PROOF_OF_AUTHORITY_WALLET_PATH`

3. Ensure the remaining variables are accurately filled in, as they are essential for proper operation.

### Part 2: Get External Dependencies

1. **Download the GeoLite2-Country Database:** Download the `GeoLite2-Country.mmdb` database from the [P3TERX/GeoLite.mmdb](https://github.com/P3TERX/GeoLite.mmdb?tab=readme-ov-file) repository.

2. **Save the Database File:** Save the downloaded file in the `static` folder:

    ```bash
    ./monorepo/cloud/comiccoin/static/GeoLite2-Country.mmdb
    ```

3. **Update the `.env` File:** Set the correct paths in the `.env` file:

    ```bash
    COMICCOIN_AUTHORITY_APP_GEOLITE_DB_PATH=./static/GeoLite2-Country.mmdb
    COMICCOIN_AUTHORITY_APP_BANNED_COUNTRIES=KP
    ```

## Part 3: Setting Up the ComicCoin Blockchain

Follow the steps below to create and set up the ComicCoin blockchain.

### Step 1: Start Docker Compose

Start the blockchain by running:

```bash
task start
```

### Step 2: Access the Running Container

In a new terminal window, enter the running container:

```bash
task console
```

### Step 3: Generate a Mnemonic Phrase

Generate a unique mnemonic phrase in the secondary terminal:

```bash
go run main.go credentials mnemonic generate
```

> **Important:** The generated mnemonic will be unique. Save it securely for future use.

Example output:

```bash
time=2025-01-15T20:24:52.242Z level=INFO msg="Successfully generated mnemonic phrase" result="<YOUR_GENERATED_MNEMONIC>"
```

### Step 4: Create the Coinbase Account

Use the generated mnemonic phrase to create your `coinbase` account:

```bash
go run main.go account new \
--wallet-label=Coinbase \
--wallet-mnemonic="<YOUR_GENERATED_MNEMONIC>" \
--wallet-path="m/44'/60'/0'/0/0"
```

### Step 5: Update Environment Variables

Update the `.env` file with the generated account information:

```bash
COMICCOIN_AUTHORITY_BLOCKCHAIN_PROOF_OF_AUTHORITY_ACCOUNT_ADDRESS="<YOUR_GENERATED_COINBASE_ADDRESS>"
COMICCOIN_AUTHORITY_BLOCKCHAIN_PROOF_OF_AUTHORITY_WALLET_MNEMONIC="<YOUR_GENERATED_MNEMONIC>"
COMICCOIN_AUTHORITY_BLOCKCHAIN_PROOF_OF_AUTHORITY_WALLET_PATH="m/44'/60'/0'/0/0"
```

### Step 6: Restart the Docker Container

Restart the container and access the console again:

```bash
task console
```

### Step 7: Create the Blockchain

Inside the container, run the following to initialize the blockchain:

```bash
go run main.go genesis new
```

### Step 8: Verify Coinbase Balance

To check the `coinbase` balance, run:

```bash
go run main.go account get --address="<YOUR_GENERATED_COINBASE_ADDRESS>"
```

---

## Part 4: Generate the Administration API Key for NFT Minter

To generate the administration API key, follow these steps:

### Step 1: Enter the Running Container

Access the container console:

```bash
task console
```

### Step 2: Generate a Secure Application Secret

Generate a secure secret key using:

```bash
openssl rand -hex 128
```

### Step 3: Generate the API Key for NFT Minting

Generate the API key using the secret key:

```bash
go run main.go credentials apikey generate --chain-id=1 --hmac-secret-key=<YOUR_GENERATED_SECRET>
```

### Step 4: Update the `.env` File with the New Credentials

Add the generated credentials to the `.env` file:

```bash
COMICCOIN_AUTHORITY_APP_ADMINISTRATION_HMAC_SECRET="<YOUR_GENERATED_SECRET>"
COMICCOIN_AUTHORITY_APP_ADMINISTRATION_SECRET_KEY="<YOUR_GENERATED_SECRET_KEY>"
COMICCOIN_AUTHORITY_APP_ADMINISTRATION_API_KEY="<YOUR_API_KEY>"
```

### Step 5: Provide the API Key to the System Administrator

Share the `api_key` with your **System Administrator** for further configuration.

### Step 6: Restart the Server

Restart the `comiccoin` server to apply the new API credentials:

```bash
task restart
```

## 🚜 Usage

Once the server is running, here are some useful commands you can execute.

### 🪙 Coins

#### 1. Generate a Mnemonic Phrase for a Test Account (e.g., `alice`)

```bash
go run main.go credentials mnemonic generate
```

#### 2. Create a Test Account (e.g., `alice`) and Transfer Coins

To create the `alice` account and transfer coins:

```bash
go run main.go account new \
--wallet-label=Alice \
--wallet-mnemonic='<YOUR_GENERATED_MNEMONIC_PHRASE_FOR_ALICE>' \
--wallet-path="m/44'/60'/0'/0/0"
```

#### 3. Transfer Coins from `coinbase` to `alice`

```bash
go run main.go coins transfer \
--value=100 \
--data="" \
--recipient-address=<YOUR_GENERATED_ALICE_ADDRESS>
```

#### 4. Verify `alice`'s Balance

Check if `alice` has received the coins:

```bash
go run main.go account get --address=<YOUR_GENERATED_ALICE_ADDRESS>
```

### 🎟️ Tokens

#### 1. Admin Mints a New Token

```bash
go run main.go tokens mint --metadata-uri='https://raw.githubusercontent.com/momokonagata/sample-NFT-metadata/refs/heads/main/assets/1'
```

#### 2. Anyone Can View the Token Using the Token ID

```bash
go run main.go tokens get --token-id=1
```

#### 3. Admin Transfers a Token to `alice`

```bash
go run main.go tokens transfer \
--recipient-address=<YOUR_GENERATED_ALICE_ADDRESS> \
--token-id=1
```

#### 4. Anyone Can View the Transferred Token

```bash
go run main.go tokens get --token-id=1
```

#### 5. Admin Burns an Existing Token

```bash
go run main.go tokens burn --token-id=2
```

## 🤝 Contributing

Found a bug or have suggestions for improvements? Please create a [GitHub issue](https://github.com/comiccoin-network/monorepo/issues/new).

## 📝 License

This application is licensed under the [**GNU Affero General Public License v3.0**](https://opensource.org/license/agpl-v3). For more details, refer to the [LICENSE](LICENSE) file.
