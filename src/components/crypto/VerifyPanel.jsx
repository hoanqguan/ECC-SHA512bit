import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, ShieldCheck, CheckCircle2, XCircle } from "lucide-react";
import { verify } from "@/lib/brainpool";
import { toast } from "sonner";

export default function VerifyPanel({ selectedKey }) {
  const [message, setMessage] = useState("");
  const [signature, setSignature] = useState("");
  const [publicKeyPem, setPublicKeyPem] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const effectivePubKey = selectedKey ? selectedKey.public_key_pem : publicKeyPem;

  const handleVerify = async () => {
    if (!message.trim()) { toast.error("Enter a message"); return; }
    if (!signature.trim()) { toast.error("Enter a signature"); return; }
    if (!effectivePubKey.trim()) { toast.error("Provide a public key or select a key pair"); return; }
    setLoading(true);
    const valid = await verify(message, signature.trim(), effectivePubKey.trim());
    setResult(valid);
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          Verify Signature
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!selectedKey && (
          <div>
            <Label className="text-xs font-medium">Public Key (PEM)</Label>
            <Textarea
              placeholder="Paste a Brainpool P-512 public key PEM here, or select a saved key pair →"
              value={publicKeyPem}
              onChange={(e) => setPublicKeyPem(e.target.value)}
              className="mt-1 h-24 resize-none font-mono text-xs"
            />
          </div>
        )}
        {selectedKey && (
          <div className="flex items-center gap-2 p-2 bg-primary/5 rounded-lg">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">{selectedKey.name}</span>
          </div>
        )}

        <div>
          <Label className="text-xs font-medium">Message</Label>
          <Textarea
            placeholder="Original message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="mt-1 h-20 resize-none font-mono text-sm"
          />
        </div>

        <div>
          <Label className="text-xs font-medium">Signature (base64)</Label>
          <Textarea
            placeholder="Paste the base64 signature..."
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            className="mt-1 h-20 resize-none font-mono text-xs"
          />
        </div>

        <Button onClick={handleVerify} disabled={loading} className="w-full">
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
          Verify
        </Button>

        {result !== null && (
          <div className={`flex items-center gap-2 p-3 rounded-lg font-semibold text-sm ${result ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
            {result
              ? <><CheckCircle2 className="w-5 h-5" /> Signature is VALID</>
              : <><XCircle className="w-5 h-5" /> Signature is INVALID</>
            }
          </div>
        )}
      </CardContent>
    </Card>
  );
}