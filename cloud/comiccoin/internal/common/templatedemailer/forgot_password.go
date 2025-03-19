package templatedemailer

import (
	"bytes"
	"context"
	"path"
	"text/template"

	"log/slog"
)

func (impl *templatedEmailer) SendUserPasswordResetEmail(ctx context.Context, email, verificationCode, firstName string) error {
	impl.Logger.Debug("sending email verification email...",
		slog.String("email", email),
		slog.String("verification_code", verificationCode),
		slog.String("first_name", firstName),
	)

	// FOR TESTING PURPOSES ONLY.
	fp := path.Join("templates", "publicfaucet/forgot_password.html")
	tmpl, err := template.ParseFiles(fp)
	if err != nil {
		impl.Logger.Error("user password reset parsing error", slog.Any("error", err))
		return err
	}

	var processed bytes.Buffer

	// Render the HTML template with our data.
	data := struct {
		Email            string
		VerificationCode string
		FirstName        string
	}{
		Email:            email,
		VerificationCode: verificationCode,
		FirstName:        firstName,
	}
	if err := tmpl.Execute(&processed, data); err != nil {
		impl.Logger.Error("user password reset template execution error", slog.Any("error", err))
		return err
	}
	body := processed.String() // DEVELOPERS NOTE: Convert our long sequence of data into a string.

	if err := impl.Emailer.Send(ctx, impl.Emailer.GetSenderEmail(), "Password Reset", email, body); err != nil {
		impl.Logger.Error("sending user password reset error", slog.Any("error", err))
		return err
	}
	impl.Logger.Debug("user password reset email sent")
	return nil
}
