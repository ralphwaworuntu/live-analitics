"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  Fingerprint,
  Loader2,
  AlertCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

const loginSchema = z.object({
  nrp: z.string()
    .min(4, { message: "ID NRP wajib minimal 4 digit" })
    .regex(/^\d+$/, { message: "ID NRP harus berupa angka" }),
  password: z.string()
    .min(5, { message: "Kata sandi minimal 5 karakter" }),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // SCANNING OVERLAY STATES
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState<"connecting" | "scanning">("connecting");

  const router = useRouter();

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { nrp: "", password: "" },
  });

  const onSubmit = async (values: LoginValues) => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        setErrorMessage(data.detail || "ID NRP atau Kata Sandi salah.");
      }
    } catch {
      setErrorMessage("KESALAHAN SISTEM: Gagal terhubung ke Server Komando.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    setIsScanning(true);
    setScanStep("connecting");
    setErrorMessage("");
    
    try {
      // Simulate biometric then hit the same mock endpoint with default credentials
      await new Promise(resolve => setTimeout(resolve, 500));
      setScanStep("scanning");
      await new Promise(resolve => setTimeout(resolve, 1000));

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nrp: "1234", password: "admin" }),
      });

      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        setErrorMessage("Biometrik gagal: Data tidak tersinkron.");
      }
    } catch {
       setErrorMessage("Sensor Error: Gagal membaca sidik jari.");
    } finally {
       setIsScanning(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.1 } }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full relative group"
      >
        <div className="absolute -inset-[2px] rounded-[22px] bg-gradient-to-r from-transparent via-[#D4AF37]/40 to-transparent blur-sm animate-[pulse_3s_ease-in-out_infinite] opacity-60 pointer-events-none" />

        <Card className="relative bg-slate-950/80 backdrop-blur-xl border border-white/5 shadow-2xl overflow-hidden p-0">
          <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-80" />

          <CardContent className="p-8 pt-10">
            <div className="flex flex-col items-center mb-8">
              <div className="w-20 h-20 rounded-2xl bg-[#0B1B32] border border-[#D4AF37]/20 flex items-center justify-center mb-5 shadow-[0_0_30px_rgba(212,175,55,0.1)] relative">
                  <ShieldCheck className="w-10 h-10 text-[#D4AF37] z-10" strokeWidth={1.5} />
              </div>

              <div className="text-center">
                <h1 className="text-3xl font-extrabold tracking-[0.25em] text-[#D4AF37] uppercase">Sentinel-AI</h1>
                <p className="text-[11px] text-white/40 uppercase tracking-[0.3em] mt-1.5 font-semibold">Biro Ops Polda NTT</p>
              </div>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

                <AnimatePresence mode="wait">
                  {errorMessage && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <Alert variant="destructive" className="mb-2 bg-red-500/10 border-red-500/40">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle className="text-[10px] font-bold uppercase tracking-widest leading-none mb-1">Akses Ditolak</AlertTitle>
                        <AlertDescription className="text-[11px] opacity-80">{errorMessage}</AlertDescription>
                      </Alert>
                    </motion.div>
                  )}
                </AnimatePresence>

                <FormField
                  control={form.control}
                  name="nrp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/50 text-[11px] uppercase tracking-widest">NRP Operator</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#D4AF37]/50" />
                          <Input
                            placeholder="Ketik NRP Anda"
                            disabled={isLoading}
                            className="font-mono bg-[#0B1B32]/50 border-white/10 h-12 pl-12 text-white focus:border-[#D4AF37]/50 transition-all placeholder:text-white/5"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-[10px] uppercase italic text-red-500" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/50 text-[11px] uppercase tracking-widest">Sandi Otoritas</FormLabel>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#D4AF37]/50" />
                        <FormControl>
                          <Input
                            placeholder="••••••••"
                            type={showPassword ? "text" : "password"}
                            disabled={isLoading}
                            className="font-mono bg-[#0B1B32]/50 border-white/10 h-12 pl-12 pr-12 text-white focus:border-[#D4AF37]/50 transition-all"
                            {...field}
                          />
                        </FormControl>
                        <button
                          type="button"
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/60 focus:outline-none"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <FormMessage className="text-[10px] uppercase italic text-red-500" />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full h-12 text-[12px] font-bold tracking-[0.2em] uppercase bg-[#D4AF37] hover:bg-[#B8962E] text-[#07111F]"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      AUTENTIKASI...
                    </>
                  ) : "MASUK KE SISTEM"}
                </Button>

                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-3">
                    <Separator className="flex-1 bg-white/[0.05]" />
                    <span className="text-[9px] text-white/20 font-bold uppercase tracking-[0.2em]">Opsi Biometrik</span>
                    <Separator className="flex-1 bg-white/[0.05]" />
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    disabled={isLoading || isScanning}
                    className="relative w-full py-8 border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.05] hover:border-[#D4AF37]/40 overflow-hidden group"
                    onClick={handleBiometricLogin}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Fingerprint className="w-7 h-7 text-white/30 group-hover:text-[#D4AF37] transition-all" />
                      <span className="text-[9px] text-white/30 uppercase tracking-[0.2em] font-mono group-hover:text-white/60">Gunakan Sidik Jari</span>
                    </div>
                  </Button>
                </div>

                <div className="mt-8 text-center pt-2">
                  <p className="text-[9px] text-red-500/50 uppercase tracking-[0.15em] font-bold leading-normal max-w-xs mx-auto">
                    AKSES TERBATAS: AREA MONITORING DAN KOMANDO INTERNAL POLDA NTT
                  </p>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </motion.div>

      {/* --- SCANNING OVERLAY FULL-SCREEN --- */}
      <AnimatePresence>
        {isScanning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950/60 backdrop-blur-md"
          >
            <div className="absolute top-10 left-10 w-16 h-16 border-t-2 border-l-2 border-[#D4AF37]/40 rounded-tl-xl pointer-events-none" />
            <div className="absolute bottom-10 right-10 w-16 h-16 border-b-2 border-r-2 border-[#D4AF37]/40 rounded-br-xl pointer-events-none" />

            <div className="relative flex flex-col items-center">
              <motion.div 
                className="w-32 h-32 rounded-3xl bg-white/[0.02] border border-white/10 flex items-center justify-center relative overflow-hidden backdrop-blur-3xl"
              >
                <Fingerprint className="w-16 h-16 text-[#D4AF37]/30" strokeWidth={1} />
                {scanStep === "scanning" && (
                  <motion.div 
                    initial={{ top: "-100%" }}
                    animate={{ top: "100%" }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent shadow-[0_0_15px_#D4AF37] z-20"
                  />
                )}
              </motion.div>

              <div className="mt-8 text-center">
                <h2 className="text-sm font-mono tracking-[0.4em] text-[#D4AF37] uppercase animate-pulse">
                  {scanStep === "connecting" ? "Initializing..." : "Reading NRP..."}
                </h2>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
