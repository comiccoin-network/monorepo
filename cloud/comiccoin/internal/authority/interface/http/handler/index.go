package handler

import (
	"fmt"
	"html/template"
	"log/slog"
	"net/http"
	"time"

	"github.com/comiccoin-network/monorepo/cloud/comiccoin/config"
	sv_blocktx "github.com/comiccoin-network/monorepo/cloud/comiccoin/internal/authority/service/blocktx"
)

type IndexHTTPHandler struct {
	config                             *config.Configuration
	logger                             *slog.Logger
	listLatestBlockTransactionsService sv_blocktx.ListLatestBlockTransactionsService
}

func NewIndexHTTPHandler(
	config *config.Configuration,
	logger *slog.Logger,
	s sv_blocktx.ListLatestBlockTransactionsService,
) *IndexHTTPHandler {
	return &IndexHTTPHandler{config, logger, s}
}

func (h *IndexHTTPHandler) Execute(w http.ResponseWriter, r *http.Request) {
	h.logger.Debug("ComicCoin Network homepage requested")

	ctx := r.Context()

	// Set content type for HTML response
	w.Header().Set("Content-Type", "text/html; charset=utf-8")

	// Use the latest transactions service with a limit of 10
	transactions, err := h.listLatestBlockTransactionsService.Execute(ctx, 10)

	if err != nil {
		h.logger.Error("Failed to get recent transactions", slog.Any("error", err))
		// Continue with empty transactions rather than failing
		transactions = nil
	}

	// Create simplified transaction view objects for the template
	type TransactionView struct {
		Type        string // "Coin Transfer" or "Digital Collectible"
		FromAddress string // Shortened address
		ToAddress   string // Shortened address
		Value       string // String representation of value
		Time        string // Formatted time
	}

	var transactionViews []TransactionView

	if transactions != nil {
		h.logger.Debug("Processing transactions for view",
			slog.Int("transaction_count", len(transactions)))

		for _, tx := range transactions {
			// Format transaction data for display
			txType := "Coin Transfer"
			if tx.Type == "token" {
				txType = "Digital Collectible"
			}

			// Get address strings
			fromAddr := "Unknown"
			toAddr := "Unknown"

			if tx.From != nil {
				fromAddr = shortenAddress(tx.From.Hex())
			}

			if tx.To != nil {
				toAddr = shortenAddress(tx.To.Hex())
			}

			// Format timestamp
			timestamp := time.Unix(int64(tx.TimeStamp/1000), 0).Format("Jan 2, 2006 3:04 PM")

			// Format value
			valueStr := "—"
			if tx.Type == "coin" {
				valueStr = formatAmount(tx.Value)
			}

			view := TransactionView{
				Type:        txType,
				FromAddress: fromAddr,
				ToAddress:   toAddr,
				Value:       valueStr,
				Time:        timestamp,
			}
			transactionViews = append(transactionViews, view)
		}
	}

	data := struct {
		Transactions    []TransactionView
		HasTransactions bool
	}{
		Transactions:    transactionViews,
		HasTransactions: len(transactionViews) > 0,
	}

	h.logger.Debug("Template data prepared",
		slog.Int("transaction_view_count", len(transactionViews)),
		slog.Bool("has_transactions", len(transactionViews) > 0))

	// Create HTML template
	tmpl := template.Must(template.New("index").Parse(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ComicCoin Network</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
            background-color: #f9f9f9;
        }
        h1 {
            color: #2c3e50;
            text-align: center;
            margin-bottom: 20px;
            font-size: 2.5em;
        }
        h2 {
            color: #3498db;
            border-bottom: 1px solid #e1e1e1;
            padding-bottom: 10px;
            margin-top: 30px;
        }
        .container {
            background-color: #fff;
            border-radius: 8px;
            padding: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .hero {
            text-align: center;
            padding: 20px;
            background-color: #f8f9fa;
            border-radius: 8px;
            margin-bottom: 30px;
        }
        .hero p {
            font-size: 1.2em;
            max-width: 800px;
            margin: 0 auto;
        }
        .section {
            margin-bottom: 40px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th, td {
            padding: 12px 15px;
            text-align: left;
            border-bottom: 1px solid #e1e1e1;
        }
        th {
            background-color: #f2f2f2;
            font-weight: bold;
        }
        tr:hover {
            background-color: #f9f9f9;
        }
        .address {
            font-family: monospace;
            color: #3498db;
        }
        .timestamp {
            white-space: nowrap;
        }
        .type-coin {
            color: #27ae60;
        }
        .type-token {
            color: #8e44ad;
        }
        .value {
            font-weight: bold;
        }
        .status-box {
            padding: 15px;
            border-radius: 6px;
            background-color: #e8f4fd;
            border: 1px solid #bedcf3;
            color: #2980b9;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
        }
        .status-circle {
            width: 12px;
            height: 12px;
            background-color: #27ae60;
            border-radius: 50%;
            margin-right: 10px;
            display: inline-block;
        }
        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 20px;
            margin-top: 30px;
        }
        .feature-card {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            text-align: center;
        }
        .feature-card h3 {
            color: #3498db;
            margin-top: 0;
        }
        .empty-state {
            text-align: center;
            padding: 40px;
            color: #7f8c8d;
        }
        footer {
            margin-top: 40px;
            text-align: center;
            font-size: 0.9em;
            color: #7f8c8d;
            padding: 20px;
        }
        a {
            color: #3498db;
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
        .cta-button {
            display: inline-block;
            background-color: #3498db;
            color: white;
            padding: 10px 20px;
            border-radius: 4px;
            font-weight: bold;
            margin-top: 15px;
            transition: background-color 0.2s;
        }
        .cta-button:hover {
            background-color: #2980b9;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <h1>Welcome to ComicCoin Network</h1>
    <div class="container">
        <div class="hero">
            <p>ComicCoin is a dedicated digital platform for comic creators and fans, allowing creators to share their work and fans to support them through a secure digital ecosystem.</p>
            <a href="https://comiccoinwallet.com" class="cta-button">Get Started</a>
        </div>

        <div class="status-box">
            <span class="status-circle"></span>
            <strong>Network Status:</strong> ComicCoin is operating normally and processing transactions
        </div>

        <div class="section">
            <h2>Recent Activity</h2>
            {{if .HasTransactions}}
                <table>
                    <thead>
                        <tr>
                            <th>Type</th>
                            <th>From</th>
                            <th>To</th>
                            <th>Amount</th>
                            <th>Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {{range .Transactions}}
                        <tr>
                            <td>{{.Type}}</td>
                            <td class="address">{{.FromAddress}}</td>
                            <td class="address">{{.ToAddress}}</td>
                            <td class="value">{{.Value}}</td>
                            <td class="timestamp">{{.Time}}</td>
                        </tr>
                        {{end}}
                    </tbody>
                </table>
            {{else}}
                <div class="empty-state">
                    <p>No recent transactions to display</p>
                </div>
            {{end}}
        </div>

        <div class="section">
            <h2>What You Can Do</h2>
            <div class="features">
                <div class="feature-card">
                    <h3>Send & Receive</h3>
                    <p>Transfer ComicCoins to other members of the community or receive coins for your contributions.</p>
                </div>
                <div class="feature-card">
                    <h3>Digital Collectibles</h3>
                    <p>Create and trade unique digital collectibles that represent comic art and characters.</p>
                </div>
                <div class="feature-card">
                    <h3>Support Creators</h3>
                    <p>Use ComicCoins to directly support your favorite comic creators and their work.</p>
                </div>
            </div>
        </div>

        <div class="section">
            <h2>Getting Started</h2>
            <p>New to ComicCoin? Follow these simple steps:</p>
            <ol>
                <li>Create a wallet using our wallet application</li>
                <li>Visit our faucet to get your first coins</li>
                <li>Start exploring digital comics and collectibles</li>
                <li>Connect with other comic enthusiasts</li>
            </ol>
            <p><a href="https://comiccoinfaucet.com">Get your first coins from our public faucet →</a></p>
        </div>
    </div>
    <footer>
        &copy; 2025 ComicCoin Network | Secure Digital Platform for Comic Creators and Fans
    </footer>
</body>
</html>
    `))

	// Execute the template
	h.logger.Debug("About to execute template")
	err = tmpl.Execute(w, data)
	if err != nil {
		h.logger.Error("Failed to render index template", slog.Any("error", err))
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}
	h.logger.Debug("Template executed successfully")
}

// Helper function to shorten Ethereum addresses for display
func shortenAddress(address string) string {
	if len(address) <= 10 {
		return address
	}
	return address[:6] + "..." + address[len(address)-4:]
}

// Helper function to format coin amounts
func formatAmount(amount uint64) string {
	if amount == 0 {
		return "0 CC"
	}
	return fmt.Sprintf("%d CC", amount)
}
