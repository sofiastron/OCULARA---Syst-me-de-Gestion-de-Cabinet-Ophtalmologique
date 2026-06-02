"""
Utilitaire d'envoi d'email de confirmation de rendez-vous.
Utilisé par : POST /agenda/appointments
"""

import smtplib
import os
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from datetime import datetime


SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5174")


def _format_date_fr(date_str: str) -> str:
    try:
        d = datetime.strptime(date_str, "%Y-%m-%d")
        jours = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"]
        mois = [
            "janvier", "février", "mars", "avril", "mai", "juin",
            "juillet", "août", "septembre", "octobre", "novembre", "décembre",
        ]
        return f"{jours[d.weekday()]} {d.day} {mois[d.month - 1]} {d.year}"
    except ValueError:
        return date_str


def _build_html_email(
    prenom_patient: str,
    nom_patient: str,
    date_rdv: str,
    heure_rdv: str,
    medecin_nom: str,
    cabinet_nom: str | None,
    lien_modifier: str,
    lien_annuler: str,
) -> str:
    date_formatee = _format_date_fr(date_rdv)
    cabinet_block = (
        f"""
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #e8eef5;">
            <span style="font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;">Cabinet</span><br>
            <strong style="font-size:15px;color:#1e293b;">{cabinet_nom}</strong>
          </td>
        </tr>"""
        if cabinet_nom
        else ""
    )

    return f"""<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmation de rendez-vous</title>
</head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:'Segoe UI',Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f0f4f8;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(13,139,234,0.12);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#026ec8 0%,#0d8bea 100%);padding:32px 28px;text-align:center;">
              <div style="width:48px;height:48px;background:rgba(255,255,255,0.2);border-radius:12px;margin:0 auto 16px;line-height:48px;font-size:24px;">👁</div>
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.02em;">Rendez-vous confirmé</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Portail Patient Ophtalmologie</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 28px;">
              <p style="margin:0 0 8px;font-size:16px;color:#1e293b;">
                Bonjour <strong>{prenom_patient} {nom_patient}</strong>,
              </p>
              <p style="margin:0 0 24px;font-size:15px;color:#64748b;line-height:1.6;">
                Votre rendez-vous a bien été enregistré. Conservez cet email pour le consulter ou le modifier.
              </p>

              <!-- Info card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f0f7ff;border:1px solid #baddfd;border-radius:12px;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding:12px 0;border-bottom:1px solid #e8eef5;">
                          <span style="font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;">Médecin</span><br>
                          <strong style="font-size:15px;color:#1e293b;">{medecin_nom}</strong>
                        </td>
                      </tr>
                      {cabinet_block}
                      <tr>
                        <td style="padding:12px 0;border-bottom:1px solid #e8eef5;">
                          <span style="font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;">Date</span><br>
                          <strong style="font-size:15px;color:#1e293b;">{date_formatee}</strong>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:12px 0;">
                          <span style="font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;">Heure</span><br>
                          <strong style="font-size:18px;color:#026ec8;">{heure_rdv}</strong>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Buttons -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding-bottom:12px;">
                    <a href="{lien_modifier}" style="display:inline-block;background:#026ec8;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 32px;border-radius:10px;min-width:200px;text-align:center;">
                      Modifier le rendez-vous
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <a href="{lien_annuler}" style="display:inline-block;background:#ffffff;color:#dc2626;text-decoration:none;font-size:15px;font-weight:600;padding:12px 32px;border-radius:10px;border:2px solid #fecaca;min-width:200px;text-align:center;">
                      Annuler le rendez-vous
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Warning -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:28px;">
                <tr>
                  <td style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:14px 16px;">
                    <p style="margin:0;font-size:13px;color:#92400e;line-height:1.5;">
                      <strong>Important :</strong> les liens de modification et d'annulation expirent
                      <strong> 24 heures avant</strong> votre rendez-vous. Passé ce délai, contactez le cabinet par téléphone.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;padding:20px 28px;text-align:center;border-top:1px solid #e2e8f0;">
              <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.5;">
                Cet email a été envoyé automatiquement — merci de ne pas y répondre.<br>
                © Portail Patient Ophtalmologie
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""


def send_confirmation_email(
    to_email: str,
    nom_patient: str,
    prenom_patient: str,
    date_rdv: str,
    heure_rdv: str,
    medecin_nom: str,
    token_modification: str,
    cancel_token: str,
    cabinet_nom: str | None = None,
) -> None:
    if not SMTP_USER or not SMTP_PASSWORD:
        print("[EMAIL] SMTP non configuré — email non envoyé")
        return

    lien_modifier = f"{FRONTEND_URL}/rendez-vous/{token_modification}/modifier"
    lien_annuler = f"{FRONTEND_URL}/rendez-vous/{cancel_token}/annuler"
    date_formatee = _format_date_fr(date_rdv)

    sujet = f"Confirmation RDV — {date_formatee} à {heure_rdv}"

    corps_html = _build_html_email(
        prenom_patient=prenom_patient,
        nom_patient=nom_patient,
        date_rdv=date_rdv,
        heure_rdv=heure_rdv,
        medecin_nom=medecin_nom,
        cabinet_nom=cabinet_nom,
        lien_modifier=lien_modifier,
        lien_annuler=lien_annuler,
    )

    corps_texte = (
        f"Bonjour {prenom_patient} {nom_patient},\n\n"
        f"Votre rendez-vous est confirmé.\n\n"
        f"Médecin : {medecin_nom}\n"
        + (f"Cabinet : {cabinet_nom}\n" if cabinet_nom else "")
        + f"Date    : {date_formatee}\n"
        f"Heure   : {heure_rdv}\n\n"
        f"Modifier : {lien_modifier}\n"
        f"Annuler  : {lien_annuler}\n\n"
        f"Ces liens expirent 24h avant votre rendez-vous."
    )

    msg = MIMEMultipart("alternative")
    msg["Subject"] = sujet
    msg["From"] = f"Portail Patient <{SMTP_USER}>"
    msg["To"] = to_email

    msg.attach(MIMEText(corps_texte, "plain", "utf-8"))
    msg.attach(MIMEText(corps_html, "html", "utf-8"))

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
        server.ehlo()
        server.starttls()
        server.login(SMTP_USER, SMTP_PASSWORD)
        server.sendmail(SMTP_USER, to_email, msg.as_string())

    print(f"[EMAIL] Confirmation envoyée à {to_email}")


def _build_html_modification_email(
    prenom_patient: str,
    nom_patient: str,
    date_rdv: str,
    heure_rdv: str,
    medecin_nom: str,
    cabinet_nom: str | None,
    lien_modifier: str,
    lien_annuler: str,
) -> str:
    date_formatee = _format_date_fr(date_rdv)
    cabinet_block = (
        f"""
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #e8eef5;">
            <span style="font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;">Cabinet</span><br>
            <strong style="font-size:15px;color:#1e293b;">{cabinet_nom}</strong>
          </td>
        </tr>"""
        if cabinet_nom
        else ""
    )

    return f"""<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Modification de votre rendez-vous</title>
</head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:'Segoe UI',Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f0f4f8;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(13,139,234,0.12);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#026ec8 0%,#0d8bea 100%);padding:32px 28px;text-align:center;">
              <div style="width:48px;height:48px;background:rgba(255,255,255,0.2);border-radius:12px;margin:0 auto 16px;line-height:48px;font-size:24px;">👁</div>
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.02em;">Rendez-vous modifié</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Portail Patient Ophtalmologie</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 28px;">
              <p style="margin:0 0 8px;font-size:16px;color:#1e293b;">
                Bonjour <strong>{prenom_patient} {nom_patient}</strong>,
              </p>
              <p style="margin:0 0 24px;font-size:15px;color:#64748b;line-height:1.6;">
                La modification de votre rendez-vous a bien été prise en compte. Voici vos nouvelles informations de rendez-vous :
              </p>

              <!-- Info card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f0f7ff;border:1px solid #baddfd;border-radius:12px;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding:12px 0;border-bottom:1px solid #e8eef5;">
                          <span style="font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;">Médecin</span><br>
                          <strong style="font-size:15px;color:#1e293b;">{medecin_nom}</strong>
                        </td>
                      </tr>
                      {cabinet_block}
                      <tr>
                        <td style="padding:12px 0;border-bottom:1px solid #e8eef5;">
                          <span style="font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;">Date</span><br>
                          <strong style="font-size:15px;color:#1e293b;">{date_formatee}</strong>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:12px 0;">
                          <span style="font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;">Heure</span><br>
                          <strong style="font-size:18px;color:#026ec8;">{heure_rdv}</strong>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Buttons -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding-bottom:12px;">
                    <a href="{lien_modifier}" style="display:inline-block;background:#026ec8;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 32px;border-radius:10px;min-width:200px;text-align:center;">
                      Modifier à nouveau
                    </a>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <a href="{lien_annuler}" style="display:inline-block;background:#ffffff;color:#dc2626;text-decoration:none;font-size:15px;font-weight:600;padding:12px 32px;border-radius:10px;border:2px solid #fecaca;min-width:200px;text-align:center;">
                      Annuler le rendez-vous
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Warning -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:28px;">
                <tr>
                  <td style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:14px 16px;">
                    <p style="margin:0;font-size:13px;color:#92400e;line-height:1.5;">
                      <strong>Important :</strong> les liens de modification et d'annulation expirent
                      <strong> 24 heures avant</strong> votre rendez-vous. Passé ce délai, contactez le cabinet par téléphone.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;padding:20px 28px;text-align:center;border-top:1px solid #e2e8f0;">
              <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.5;">
                Cet email a été envoyé automatiquement — merci de ne pas y répondre.<br>
                © Portail Patient Ophtalmologie
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""


def send_modification_email(
    to_email: str,
    nom_patient: str,
    prenom_patient: str,
    date_rdv: str,
    heure_rdv: str,
    medecin_nom: str,
    token_modification: str,
    cancel_token: str,
    cabinet_nom: str | None = None,
) -> None:
    if not SMTP_USER or not SMTP_PASSWORD:
        print("[EMAIL] SMTP non configuré — email de modification non envoyé")
        return

    lien_modifier = f"{FRONTEND_URL}/rendez-vous/{token_modification}/modifier"
    lien_annuler = f"{FRONTEND_URL}/rendez-vous/{cancel_token}/annuler"
    date_formatee = _format_date_fr(date_rdv)

    sujet = f"Modification de votre RDV — {date_formatee} à {heure_rdv}"

    corps_html = _build_html_modification_email(
        prenom_patient=prenom_patient,
        nom_patient=nom_patient,
        date_rdv=date_rdv,
        heure_rdv=heure_rdv,
        medecin_nom=medecin_nom,
        cabinet_nom=cabinet_nom,
        lien_modifier=lien_modifier,
        lien_annuler=lien_annuler,
    )

    corps_texte = (
        f"Bonjour {prenom_patient} {nom_patient},\n\n"
        f"La modification de votre rendez-vous a bien été prise en compte.\n\n"
        f"Médecin : {medecin_nom}\n"
        + (f"Cabinet : {cabinet_nom}\n" if cabinet_nom else "")
        + f"Date    : {date_formatee}\n"
        f"Heure   : {heure_rdv}\n\n"
        f"Modifier à nouveau : {lien_modifier}\n"
        f"Annuler            : {lien_annuler}\n\n"
        f"Ces liens expirent 24h avant votre rendez-vous."
    )

    msg = MIMEMultipart("alternative")
    msg["Subject"] = sujet
    msg["From"] = f"Portail Patient <{SMTP_USER}>"
    msg["To"] = to_email

    msg.attach(MIMEText(corps_texte, "plain", "utf-8"))
    msg.attach(MIMEText(corps_html, "html", "utf-8"))

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
        server.ehlo()
        server.starttls()
        server.login(SMTP_USER, SMTP_PASSWORD)
        server.sendmail(SMTP_USER, to_email, msg.as_string())

    print(f"[EMAIL] Modification envoyée à {to_email}")


def _build_html_cancellation_email(
    prenom_patient: str,
    nom_patient: str,
    date_rdv: str,
    heure_rdv: str,
    medecin_nom: str,
    cabinet_nom: str | None,
) -> str:
    date_formatee = _format_date_fr(date_rdv)
    cabinet_block = (
        f"""
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #e8eef5;">
            <span style="font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;">Cabinet</span><br>
            <strong style="font-size:15px;color:#1e293b;">{cabinet_nom}</strong>
          </td>
        </tr>"""
        if cabinet_nom
        else ""
    )

    return f"""<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Annulation de votre rendez-vous</title>
</head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:'Segoe UI',Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f0f4f8;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(13,139,234,0.12);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#dc2626 0%,#b91c1c 100%);padding:32px 28px;text-align:center;">
              <div style="width:48px;height:48px;background:rgba(255,255,255,0.2);border-radius:12px;margin:0 auto 16px;line-height:48px;font-size:24px;">🚫</div>
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.02em;">Rendez-vous annulé</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Portail Patient Ophtalmologie</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 28px;">
              <p style="margin:0 0 8px;font-size:16px;color:#1e293b;">
                Bonjour <strong>{prenom_patient} {nom_patient}</strong>,
              </p>
              <p style="margin:0 0 24px;font-size:15px;color:#64748b;line-height:1.6;">
                Nous vous confirmons que votre rendez-vous a bien été annulé. Le créneau a été libéré.
              </p>

              <!-- Info card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="padding:12px 0;border-bottom:1px solid #fee2e2;">
                          <span style="font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;">Médecin</span><br>
                          <strong style="font-size:15px;color:#1e293b;">{medecin_nom}</strong>
                        </td>
                      </tr>
                      {cabinet_block}
                      <tr>
                        <td style="padding:12px 0;border-bottom:1px solid #fee2e2;">
                          <span style="font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;">Date</span><br>
                          <strong style="font-size:15px;color:#1e293b;">{date_formatee}</strong>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:12px 0;">
                          <span style="font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;">Heure</span><br>
                          <strong style="font-size:18px;color:#dc2626;">{heure_rdv}</strong>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:14px;color:#64748b;line-height:1.6;text-align:center;">
                Si vous souhaitez prendre un nouveau rendez-vous, vous pouvez vous rendre sur notre portail à tout moment.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;padding:20px 28px;text-align:center;border-top:1px solid #e2e8f0;">
              <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.5;">
                Cet email a été envoyé automatiquement — merci de ne pas y répondre.<br>
                © Portail Patient Ophtalmologie
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""


def send_cancellation_email(
    to_email: str,
    nom_patient: str,
    prenom_patient: str,
    date_rdv: str,
    heure_rdv: str,
    medecin_nom: str,
    cabinet_nom: str | None = None,
) -> None:
    if not SMTP_USER or not SMTP_PASSWORD:
        print("[EMAIL] SMTP non configuré — email d'annulation non envoyé")
        return

    date_formatee = _format_date_fr(date_rdv)

    sujet = f"Annulation de votre RDV — {date_formatee} à {heure_rdv}"

    corps_html = _build_html_cancellation_email(
        prenom_patient=prenom_patient,
        nom_patient=nom_patient,
        date_rdv=date_rdv,
        heure_rdv=heure_rdv,
        medecin_nom=medecin_nom,
        cabinet_nom=cabinet_nom,
    )

    corps_texte = (
        f"Bonjour {prenom_patient} {nom_patient},\n\n"
        f"Nous vous confirmons que votre rendez-vous a bien été annulé.\n\n"
        f"Médecin : {medecin_nom}\n"
        + (f"Cabinet : {cabinet_nom}\n" if cabinet_nom else "")
        + f"Date    : {date_formatee}\n"
        f"Heure   : {heure_rdv}\n\n"
        f"Le créneau a été libéré."
    )

    msg = MIMEMultipart("alternative")
    msg["Subject"] = sujet
    msg["From"] = f"Portail Patient <{SMTP_USER}>"
    msg["To"] = to_email

    msg.attach(MIMEText(corps_texte, "plain", "utf-8"))
    msg.attach(MIMEText(corps_html, "html", "utf-8"))

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
        server.ehlo()
        server.starttls()
        server.login(SMTP_USER, SMTP_PASSWORD)
        server.sendmail(SMTP_USER, to_email, msg.as_string())

    print(f"[EMAIL] Annulation envoyée à {to_email}")
