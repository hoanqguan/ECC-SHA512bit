import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Download, Copy, Check, AlertCircle, Loader2, FileUp } from "lucide-react";
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

export default function FileEncryptPanel({ selectedKey }) {
  const [mode, setMode] = useState("encrypt");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [resultFile, setResultFile] = useState(null);
  const [copied, setCopied] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleEncryptFile = async (file) => {
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

  const handleDecryptFile = async (file) => {
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

  const handleSignFile = async (file) => {
    if (!file || !selectedKey) {
      toast.error("Please select both a file and a key");
      return;
    }

    setLoading(true);
    try {
      const signed = await signFile(file, selectedKey.privateKeyPem);
      setResult({
        type: "signed",
        data: signed,
        filename: file.name,
      });
      toast.success("File signed successfully!");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyFile = async (file) => {
    if (!file || !selectedKey) {
      toast.error("Please select both a file and a key");
      return;
    }

    setLoading(true);
    try {
      const signedContent = await importSignedFile(file);
      const verification = await verifyFile(signedContent, selectedKey.publicKeyPem);
      
      if (verification.isValid) {
        setResultFile({
          filename: verification.filename,
          data: verification.fileData,
        });
        
        setResult({
          type: "verified",
          isValid: true,
          info: `✓ Signature valid for: ${verification.filename}`,
          timestamp: verification.timestamp,
        });
        
        toast.success("Signature verified successfully!");
      } else {
        setResult({
          type: "verified",
          isValid: false,
          info: "✗ Signature verification FAILED",
        });
        
        toast.error("Signature verification failed!");
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      processFile(files[0]);
    }
  };

  const processFile = (file) => {
    switch (mode) {
      case "encrypt":
        handleEncryptFile(file);
        break;
      case "decrypt":
        handleDecryptFile(file);
        break;
      case "sign":
        handleSignFile(file);
        break;
      case "verify":
        handleVerifyFile(file);
        break;
      default:
        break;
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result.data);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Copied to clipboard!");
  };

  const downloadResult = () => {
    if (result.type === "encrypted") {
      downloadEncryptedFile(result.data, `${result.filename}.encrypted`);
    } else if (result.type === "signed") {
      downloadSignedFile(result.data, `${result.filename}.signed`);
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
        <CardTitle>File Operations</CardTitle>
        <CardDescription>
          Encrypt, decrypt, sign, or verify files using your keys
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={mode} onValueChange={setMode}>
          <TabsList className="w-full">
            <TabsTrigger value="encrypt" className="flex-1">Encrypt</TabsTrigger>
            <TabsTrigger value="decrypt" className="flex-1">Decrypt</TabsTrigger>
            <TabsTrigger value="sign" className="flex-1">Sign</TabsTrigger>
            <TabsTrigger value="verify" className="flex-1">Verify</TabsTrigger>
          </TabsList>

          {/* ENCRYPT */}
          <TabsContent value="encrypt" className="space-y-4">
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${
                dragActive
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-muted-foreground/50"
              }`}
            >
              <FileUp className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm font-medium mb-1">Drag and drop your file here</p>
              <p className="text-xs text-muted-foreground mb-3">or click to select</p>
              <Input
                type="file"
                onChange={handleFileInput}
                disabled={loading}
                className="cursor-pointer"
                accept="*/*"
                style={{ display: "none" }}
                id="encrypt-input"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById("encrypt-input")?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Select File
              </Button>
            </div>
            
            {result?.type === "encrypted" && (
              <Card className="bg-muted/50">
                <CardContent className="pt-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Encrypted Output:</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={copyToClipboard}
                    >
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
                  <Button onClick={downloadResult} className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Download Encrypted File
                  </Button>
                </CardContent>
              </Card>
            )}
            
            {loading && (
              <div className="flex justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            )}
          </TabsContent>

          {/* DECRYPT */}
          <TabsContent value="decrypt" className="space-y-4">
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${
                dragActive
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-muted-foreground/50"
              }`}
            >
              <FileUp className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm font-medium mb-1">Drag and drop encrypted file here</p>
              <p className="text-xs text-muted-foreground mb-3">or click to select</p>
              <Input
                type="file"
                onChange={handleFileInput}
                disabled={loading}
                className="cursor-pointer"
                style={{ display: "none" }}
                id="decrypt-input"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById("decrypt-input")?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Select File
              </Button>
            </div>
            
            {result?.type === "decrypted" && (
              <Card className="bg-green-50 dark:bg-green-950/30 border-green-200">
                <CardContent className="pt-6 space-y-3">
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
                </CardContent>
              </Card>
            )}
            
            {loading && (
              <div className="flex justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            )}
          </TabsContent>

          {/* SIGN */}
          <TabsContent value="sign" className="space-y-4">
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${
                dragActive
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-muted-foreground/50"
              }`}
            >
              <FileUp className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm font-medium mb-1">Drag and drop your file here</p>
              <p className="text-xs text-muted-foreground mb-3">or click to select</p>
              <Input
                type="file"
                onChange={handleFileInput}
                disabled={loading}
                className="cursor-pointer"
                accept="*/*"
                style={{ display: "none" }}
                id="sign-input"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById("sign-input")?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Select File
              </Button>
            </div>
            
            {result?.type === "signed" && (
              <Card className="bg-muted/50">
                <CardContent className="pt-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Signed Data:</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={copyToClipboard}
                    >
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
                  <Button onClick={downloadResult} className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Download Signed File
                  </Button>
                </CardContent>
              </Card>
            )}
            
            {loading && (
              <div className="flex justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            )}
          </TabsContent>

          {/* VERIFY */}
          <TabsContent value="verify" className="space-y-4">
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${
                dragActive
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-muted-foreground/50"
              }`}
            >
              <FileUp className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm font-medium mb-1">Drag and drop signed file here</p>
              <p className="text-xs text-muted-foreground mb-3">or click to select</p>
              <Input
                type="file"
                onChange={handleFileInput}
                disabled={loading}
                className="cursor-pointer"
                style={{ display: "none" }}
                id="verify-input"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById("verify-input")?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Select File
              </Button>
            </div>
            
            {result?.type === "verified" && (
              <Card
                className={
                  result.isValid
                    ? "bg-green-50 dark:bg-green-950/30 border-green-200"
                    : "bg-red-50 dark:bg-red-950/30 border-red-200"
                }
              >
                <CardContent className="pt-6 space-y-3">
                  <div
                    className={
                      result.isValid
                        ? "flex items-center gap-2 text-green-700 dark:text-green-400"
                        : "flex items-center gap-2 text-red-700 dark:text-red-400"
                    }
                  >
                    {result.isValid ? (
                      <>
                        <Check className="w-5 h-5" />
                        <span className="font-medium">Signature Valid</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-5 h-5" />
                        <span className="font-medium">Signature Invalid</span>
                      </>
                    )}
                  </div>
                  <p className="text-sm">{result.info}</p>
                  {result.timestamp && (
                    <p className="text-xs text-muted-foreground">
                      Signed: {new Date(result.timestamp).toLocaleString()}
                    </p>
                  )}
                  {result.isValid && resultFile && (
                    <Button onClick={downloadDecrypted} className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Download Verified File
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
        </Tabs>
      </CardContent>
    </Card>
  );
}
