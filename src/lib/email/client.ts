import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;

if (!resendApiKey) {
    console.warn("Missing RESEND_API_KEY - email functionality disabled");
}

export const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function sendEmail({
    to,
    subject,
    html,
    from = "E2 Market Intelligence <noreply@e-2.at>",
}: {
    to: string | string[];
    subject: string;
    html: string;
    from?: string;
}) {
    if (!resend) {
        console.log("[Email] Skipped (no API key):", { to, subject });
        return { success: false, error: "Email service not configured" };
    }

    try {
        const { data, error } = await resend.emails.send({
            from,
            to: Array.isArray(to) ? to : [to],
            subject,
            html,
        });

        if (error) {
            console.error("[Email] Error:", error);
            return { success: false, error: error.message };
        }

        console.log("[Email] Sent:", data?.id);
        return { success: true, id: data?.id };
    } catch (err) {
        console.error("[Email] Exception:", err);
        return { success: false, error: String(err) };
    }
}
