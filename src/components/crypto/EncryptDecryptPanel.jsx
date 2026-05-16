import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Upload, Download, Copy, Check, AlertCircle, Loader2, FileText } from "lucide-react";
import { toast } from "sonner";
import {
  encryptFile,
  decryptFile,
  signFile,
  verifyFile,
  downloadEncryptedFile,
  downloadSignedFile,
  importEncryptedFile,
  importSignedFile,
} from "@/utils/fileOperations";
import { encrypt, decrypt, sign, verify } from "@/lib/brainpool.js";

export default function EncryptDecryptPanel({ selectedKey }) {
  const [mode, setMode] = useState("encrypt");
  const [inputType, setInputType] = useState("text"); // text or file
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [resultFile, setResultFile] = useState(null);
  const [copied, setCopied] = useState(false);
  const [textInput, setTextInput] = useState("");

  // ===== TEXT OPERATIONS =====
  const handleEncryptText = async () => {
    if (!textInput || !selectedKey) {
      toast.error("Please enter text and select a key");
      return;
    }
    setLoading(true);
    try {
      const encrypted = await encrypt(textInput, selectedKey.publicKeyPem);
      setResult({
        type: "encrypted",
        data: encrypted,
      });
      toast.success("Text encrypted successfully!");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDecryptText = async () => {
    if (!textInput || !selectedKey) {
      toast.error("Please paste encrypted text and select a key");
      return;
    }
    setLoading(true);
    try {
      const decrypted = await decrypt(textInput, selectedKey.privateKeyPem);
      setResult({
        type: "decrypted",
        data: decrypted,
      });
      toast.success("Text decrypted successfully!");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // ===== FILE OPERATIONS =====
  const handleEncryptFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedKey) {
      toast.error("Please select both a file and a key");
      return;
    }

    setLoading(true);
    try {
      const encrypted = await encryptFile(file, selectedKey.publicKeyPem);
      setResult({
        type: "encrypted",
        data: encrypted,
        filename: file.name,
      });
      toast.success("File encrypted successfully!");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDecryptFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedKey) {
      toast.error("Please select both a file and a key");
      return;
    }

    setLoading(true);
    try {
      const encryptedContent = await importEncryptedFile(file);
      const decrypted = await decryptFile(encryptedContent, selectedKey.privateKeyPem);

      setResultFile({
        filename: decrypted.filename,
        data: decrypted.data,
        size: decrypted.size,
        type: decrypted.type,
      });

      setResult({
        type: "decrypted",
        info: `Decrypted: ${decrypted.filename} (${decrypted.size} bytes)`,
        timestamp: decrypted.timestamp,
      });

      toast.success("File decrypted successfully!");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result.data);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Copied to clipboard!");
  };

  const downloadEncryptedResult = () => {
    if (result.type === "encrypted" && result.filename) {
      downloadEncryptedFile(result.data, `${result.filename}.encrypted`);
    }
  };

  const downloadDecrypted = () => {
    if (resultFile) {
      const blob = new Blob([resultFile.data]);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = resultFile.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("File downloaded!");
    }
  };

  if (!selectedKey) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>Please select a key pair first</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Encrypt / Decrypt</CardTitle>
        <CardDescription>
          Choose between text or file encryption
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input Type Toggle */}
        <div className="flex items-center gap-3 pb-4 border-b">
          <span className="text-sm font-medium text-muted-foreground">Input Type:</span>
          <ToggleGroup value={inputType} onValueChange={setInputType} type="single">
            <ToggleGroupItem value="text" aria-label="Text">
              Text
            </ToggleGroupItem>
            <ToggleGroupItem value="file" aria-label="File">
              <FileText className="w-4 h-4 mr-1" />
              File
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Mode Tabs */}
        <Tabs value={mode} onValueChange={setMode}>
          <TabsList className="w-full">
            <TabsTrigger value="encrypt" className="flex-1">
              Encrypt
            </TabsTrigger>
            <TabsTrigger value="decrypt" className="flex-1">
              Decrypt
            </TabsTrigger>
          </TabsList>

          {/* ===== ENCRYPT TAB ===== */}
          <TabsContent value="encrypt" className="space-y-4">
            {inputType === "text" ? (
              // TEXT ENCRYPT
              <>
                <Textarea
                  placeholder="Enter text to encrypt..."
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  className="h-32"
                />
                <Button onClick={handleEncryptText} disabled={loading} className="w-full">
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Encrypt Text
                </Button>
              </>
            ) : (
              // FILE ENCRYPT
              <div className="border-2 border-dashed rounded-lg p-6">
                <Input
                  type="file"
                  onChange={handleEncryptFile}
                  disabled={loading}
                  className="cursor-pointer"
                  accept="*/*"
                />
              </div>
            )}

            {result?.type === "encrypted" && (
              <Card className="bg-muted/50">
                <CardContent className="pt-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {inputType === "file" ? "Encrypted File:" : "Encrypted Output:"}
                    </span>
                    <Button size="sm" variant="outline" onClick={copyToClipboard}>
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 mr-1" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-1" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                  <Textarea
                    value={result.data}
                    readOnly
                    className="h-32 font-mono text-xs"
                  />
                  {inputType === "file" && (
                    <Button onClick={downloadEncryptedResult} className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Download .encrypted File
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {loading && (
              <div className="flex justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            )}
          </TabsContent>

          {/* ===== DECRYPT TAB ===== */}
          <TabsContent value="decrypt" className="space-y-4">
            {inputType === "text" ? (
              // TEXT DECRYPT
              <>
                <Textarea
                  placeholder="Paste encrypted text here..."
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  className="h-32"
                />
                <Button onClick={handleDecryptText} disabled={loading} className="w-full">
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Decrypt Text
                </Button>
              </>
            ) : (
              // FILE DECRYPT
              <div className="border-2 border-dashed rounded-lg p-6">
                <Input
                  type="file"
                  onChange={handleDecryptFile}
                  disabled={loading}
                  className="cursor-pointer"
                  accept=".encrypted,application/json"
                />
              </div>
            )}

            {result?.type === "decrypted" && (
              <Card className="bg-green-50 dark:bg-green-950/30 border-green-200">
                <CardContent className="pt-6 space-y-3">
                  {inputType === "text" ? (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Decrypted Text:</span>
                        <Button size="sm" variant="outline" onClick={copyToClipboard}>
                          {copied ? (
                            <>
                              <Check className="w-4 h-4 mr-1" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4 mr-1" />
                              Copy
                            </>
                          )}
                        </Button>
                      </div>
                      <Textarea value={result.data} readOnly className="h-32" />
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                        <Check className="w-5 h-5" />
                        <span className="font-medium">{result.info}</span>
                      </div>
                      {result.timestamp && (
                        <p className="text-xs text-muted-foreground">
                          Timestamp: {new Date(result.timestamp).toLocaleString()}
                        </p>
                      )}
                      {resultFile && (
                        <Button onClick={downloadDecrypted} className="w-full">
                          <Download className="w-4 h-4 mr-2" />
                          Download Decrypted File
                        </Button>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {loading && (
              <div className="flex justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
