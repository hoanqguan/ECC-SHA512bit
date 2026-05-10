import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, PenLine, Copy, CheckCircle2 } from "lucide-react";
import { sign } from "@/lib/brainpool";
import { toast } from "sonner";

export default function SignPanel({ selectedKey }) {
  const [message, setMessage] = useState("");
  const [signature, setSignature] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSign = async () => {
    if (!message.trim()) { toast.error("Enter a message to sign"); return; }
    if (!selectedKey) { toast.error("Select a key pair first"); return; }
    setLoading(true);
    const sig = await sign(message, selectedKey.private_key_pem);
    setSignature(sig);
    setLoading(false);
    toast.success("Message signed successfully");
  };

  const copySignature = () => {
    navigator.clipboard.writeText(signature);
    toast.success("Signature copied");
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <PenLine className="w-4 h-4" />
          Sign Message
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {selectedKey ? (
          <div className="flex items-center gap-2 p-2 bg-primary/5 rounded-lg">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">{selectedKey.name}</span>
            <Badge variant="outline" className="text-xs ml-auto">Active Key</Badge>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground italic">← Select a key pair from the list</p>
        )}

        <div>
          <Label className="text-xs font-medium">Message</Label>
          <Textarea
            placeholder="Enter the message to sign..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="mt-1 h-28 resize-none font-mono text-sm"
          />
        </div>

        <Button onClick={handleSign} disabled={loading || !selectedKey} className="w-full">
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <PenLine className="w-4 h-4 mr-2" />}
          Sign
        </Button>

        {signature && (
          <div>
            <div className="flex justify-between items-center mb-1">
              <Label className="text-xs font-medium text-muted-foreground">SIGNATURE (base64)</Label>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={copySignature}>
                <Copy className="w-3 h-3" />
              </Button>
            </div>
            <Textarea
              value={signature}
              readOnly
              className="text-xs font-mono h-24 resize-none bg-muted/50"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}