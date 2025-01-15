# ⚖️ ComicCoin Blockchain Authority

The ⚖️ ComicCoin Blockchain Authority is a central server that implements the "Proof of Authority" consensus mechanism for all connected nodes. This repository contains the necessary code and instructions to set up and run the authority.

## 📖 Installation

### Step 1: Set Up Your Go Environment

1. Navigate to your Go folder and create a new directory for the ComicCoin Network:

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

2. Fill in the environment variables in the `.env` file as best as you can. **Note:** The following variables will be filled later and should be skipped for now:
   * `COMICCOIN_AUTHORITY_APP_ADMINISTRATION_HMAC_SECRET`
   * `COMICCOIN_AUTHORITY_APP_ADMINISTRATION_SECRET_KEY`
   * `COMICCOIN_AUTHORITY_APP_ADMINISTRATION_API_KEY`
   * `COMICCOIN_AUTHORITY_APP_GEOLITE_DB_PATH`
   * `COMICCOIN_AUTHORITY_APP_BANNED_COUNTRIES`
   * `COMICCOIN_AUTHORITY_BLOCKCHAIN_PROOF_OF_AUTHORITY_ACCOUNT_ADDRESS`
   * `COMICCOIN_AUTHORITY_BLOCKCHAIN_PROOF_OF_AUTHORITY_WALLET_MNEMONIC`
   * `COMICCOIN_AUTHORITY_BLOCKCHAIN_PROOF_OF_AUTHORITY_WALLET_PATH`

3. Ensure the remaining variables are filled in accurately, as they are crucial for proper operation.

### Part 2: Get External Dependencies

1. **Download GeoLite2-Country Database:** Download the GeoLite2-Country.mmdb database from the [P3TERX/GeoLite.mmdb](https://github.com/P3TERX/GeoLite.mmdb?tab=readme-ov-file) repository.

2. **Save the Database File:** Save the downloaded file in the `static` folder:

    ```bash
    ./monorepo/cloud/comiccoin-authority/static/GeoLite2-Country.mmdb
    ```

3. **Configure Environment Variables:** Update the `.env` file:

    ```bash
    COMICCOIN_AUTHORITY_APP_GEOLITE_DB_PATH=./static/GeoLite2-Country.mmdb
    COMICCOIN_AUTHORITY_APP_BANNED_COUNTRIES=KP
    ```

Example configuration:

```bash
COMICCOIN_AUTHORITY_APP_GEOLITE_DB_PATH=./static/GeoLite2-Country.mmdb
COMICCOIN_AUTHORITY_APP_BANNED_COUNTRIES=KP
```

### Part 3: Create the ComicCoin Blockchain

Follow these steps to create the ComicCoin blockchain.

#### Step 1: Start Docker Compose

Start the blockchain with the following command:

```bash
task start
```

#### Step 2: Enter the Running Container

Open a new terminal window and enter the running container:

```bash
task console
```

#### Step 3: Generate Mnemonic Phrase

Inside the secondary terminal window, generate a unique mnemonic phrase:

```bash
go run main.go credentials mnemonic generate
```

**Important:** The output will be unique. Save it for future use.

Example output:

```bash
time=2025-01-15T20:24:52.242Z level=INFO msg="Successfully generated mnemonic phrase" result="<YOUR_GENERATED_MNEMOMIC_PHRASE>"
```

#### Step 4: Create Coinbase Account

Create your `coinbase` account using the mnemonic phrase:

```bash
go run main.go account new \
--wallet-label=Coinbase \
--wallet-mnemonic="<YOUR_GENERATED_MNEMOMIC_PHRASE>" \
--wallet-path="m/44'/60'/0'/0/0";
```

#### Step 5: Update Environment Variables

Use the generated output to update the `.env` file:

```bash
COMICCOIN_AUTHORITY_BLOCKCHAIN_PROOF_OF_AUTHORITY_ACCOUNT_ADDRESS='<YOUR_GENERATED_COINBASE_ADDRESS>'
COMICCOIN_AUTHORITY_BLOCKCHAIN_PROOF_OF_AUTHORITY_WALLET_MNEMONIC='<YOUR_GENERATED_MNEMOMIC_PHRASE>'
COMICCOIN_AUTHORITY_BLOCKCHAIN_PROOF_OF_AUTHORITY_WALLET_PATH="m/44'/60'/0'/0/0"
```

#### Step 6: Restart Docker Container and Enter Console Again

Restart the container and enter the console again:

```bash
task console
```

#### Step 7: Create Blockchain

Create the blockchain inside the container:

```bash
go run main.go genesis new
```

#### Step 8: Verify Coinbase Balance

Check that `coinbase` has coins:

```bash
go run main.go account get --address=<YOUR_GENERATED_COINBASE_ADDRESS>
```

### Part 4: Generate Administration API Key for NFT Minter

1. Enter the running container:

    ```bash
    task console
    ```

2. Generate a secure application secret:

    ```bash
    openssl rand -hex 128
    ```

3. Generate the API key for NFT minting:

    ```bash
    go run main.go credentials apikey generate --chain-id=1 --hmac-secret-key=<YOUR_GENERATED_SECRET>
    ```

4. Update the `.env` file with the new credentials:

```bash
COMICCOIN_AUTHORITY_APP_ADMINISTRATION_HMAC_SECRET='<YOUR_GENERATED_SECRET>'
COMICCOIN_AUTHORITY_APP_ADMINISTRATION_SECRET_KEY='<YOUR_GENERATED_SECRET_KEY>'
COMICCOIN_AUTHORITY_APP_ADMINISTRATION_API_KEY='<YOUR_API_KEY>'
```

5. Provide the **System Administrator** with the `api_key`.

6. Restart the `comiccoin-authority` server to apply the new credentials.

## 🚜 Usage

Assuming the server is running and you are in the console, here are some commands you can execute.

### 🪙 Coins

1. Create the mnemonic phrase for a test account called `alice`.

    ```bash
    go run main.go credentials mnemonic generate
    ```

2. Create a test account called `alice` and transfer coins:

    ```bash
    go run main.go account new \
    --wallet-label=Alice \
    --wallet-mnemonic='<YOUR_GENERATED_MNEMOMIC_PHRASE_FOR_ALICE>' \
    --wallet-path="m/44'/60'/0'/0/0";
    ```

3. Transfer coins from `coinbase` to `alice`:

    ```bash
    go run main.go coins transfer \
    --value=100 \
    --data="" \
    --recipient-address=<YOUR_GENERATED_ALICE_ADDRESS>;
    ```

4. Verify that `alice` has received the coins:

    ```bash
    go run main.go account get --address=<YOUR_GENERATED_ALICE_ADDRESS>
    ```

### 🎟️ Tokens

1. Admin creates a new token:

    ```bash
    go run main.go tokens mint --metadata-uri='https://raw.githubusercontent.com/momokonagata/sample-NFT-metadata/refs/heads/main/assets/1'
    ```

2. Anyone can view the new token using the token ID:

    ```bash
    go run main.go tokens get --token-id=1
    ```

3. Admin transfers an existing token to `alice`:

    ```bash
    go run main.go tokens transfer \
    --recipient-address=<YOUR_GENERATED_ALICE_ADDRESS> \
    --token-id=1
    ```

4. Anyone can view the existing token:

    ```bash
    go run main.go tokens get --token-id=1
    ```

5. Admin burns an existing token:

    ```bash
    go run main.go tokens burn --token-id=2
    ```

## 🤝 Contributing

Found a bug? Want a feature to improve the monorepo? Please create an [issue](https://github.com/comiccoin-network/monorepo/issues/new).

## 📝 License

This application is licensed under the [**GNU Affero General Public License v3.0**](https://opensource.org/license/agpl-v3). See [LICENSE](LICENSE) for more information.
