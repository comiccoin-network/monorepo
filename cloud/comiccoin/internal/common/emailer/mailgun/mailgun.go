package mailgun

import (
	"context"
	"time"

	"log/slog"

	"github.com/mailgun/mailgun-go/v4"
)

type Emailer interface {
	Send(ctx context.Context, sender, subject, recipient, htmlContent string) error
	GetSenderEmail() string
	GetDomainName() string // Deprecated
	GetBackendDomainName() string
	GetFrontendDomainName() string
	GetMaintenanceEmail() string
}

type mailgunEmailer struct {
	config  MailgunConfigurationProvider
	Mailgun *mailgun.MailgunImpl
	Logger  *slog.Logger
}

func NewEmailer(config MailgunConfigurationProvider, logger *slog.Logger) Emailer {
	// Defensive code: Make sure we have access to the file before proceeding any further with the code.
	logger.Debug("mailgun emailer initializing...")
	mg := mailgun.NewMailgun(config.GetDomainName(), config.GetAPIKey())
	logger.Debug("mailgun emailer was initialized.")

	mg.SetAPIBase(config.GetAPIBase()) // Override to support our custom email requirements.

	return &mailgunEmailer{
		config:  config,
		Mailgun: mg,
		Logger:  logger,
	}
}

func (me *mailgunEmailer) Send(ctx context.Context, sender, subject, recipient, body string) error {
	me.Logger.Debug("sent email",
		slog.String("domain", me.GetDomainName()),
		slog.String("frontend_domain", me.GetFrontendDomainName()),
		slog.String("backend_domain", me.GetBackendDomainName()),
		slog.String("sender", sender),
		slog.String("subject", subject),
		slog.String("recipient", recipient))

	message := me.Mailgun.NewMessage(sender, subject, "", recipient)
	message.SetHtml(body)

	ctx, cancel := context.WithTimeout(ctx, time.Second*10)
	defer cancel()

	// Send the message with a 10 second timeout
	_, id, err := me.Mailgun.Send(ctx, message)

	if err != nil {
		me.Logger.Error("emailer failed sending",
			slog.String("domain", me.GetDomainName()),
			slog.String("frontend_domain", me.GetFrontendDomainName()),
			slog.String("backend_domain", me.GetBackendDomainName()),
			slog.Any("err", err))
		return err
	}

	me.Logger.Debug("emailer sent with response", slog.Any("response id", id))

	return nil
}

func (me *mailgunEmailer) GetDomainName() string {
	return me.config.GetDomainName()
}

func (me *mailgunEmailer) GetSenderEmail() string {
	return me.config.GetSenderEmail()
}

func (me *mailgunEmailer) GetBackendDomainName() string {
	return me.config.GetBackendDomainName()
}

func (me *mailgunEmailer) GetFrontendDomainName() string {
	return me.config.GetFrontendDomainName()
}

func (me *mailgunEmailer) GetMaintenanceEmail() string {
	return me.config.GetMaintenanceEmail()
}
