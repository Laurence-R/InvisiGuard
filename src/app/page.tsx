import Link from "next/link";
import Image from "next/image";
import {
	Shield,
	Lock,
	Zap,
	Eye,
	Layers,
	Cpu,
	ArrowRight,
	CheckCircle,
	Fingerprint,
	FileCheck,
	ScanEye,
	Activity,
	FileImage
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LandingPage() {
	return (
		<div className="flex min-h-screen flex-col bg-background font-sans text-foreground">


			<main className="flex-1">
				{/* Hero Section */}
        <section className="relative overflow-hidden pt-28 md:pt-32 pb-16">
					<div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">

						{/* Logo Section */}
						<div className="flex justify-center mb-8">
							<div className="relative group">
								<div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-blue-600/20 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
								<div className="relative p-4 bg-background/50 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10">
									<Image
										src="/invisiGuard.svg"
										width={100}
										height={100}
										alt="InvisiGuard Logo"
										className="w-20 h-20 sm:w-24 sm:h-24 drop-shadow-sm"
										priority
									/>
								</div>
							</div>
						</div>

						<Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm font-normal rounded-full border-primary/20 bg-primary/5 text-primary">
							<span className="flex items-center gap-1.5">
								<span className="relative flex h-2 w-2">
									<span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
									<span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
								</span>
								Preview v0.1.0
							</span>
						</Badge>

						<h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 max-w-4xl mx-auto leading-tight">
							隱形數位浮水印 <br />
							<span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
								DWT + QIM 演算法核心
							</span>
						</h1>

						<p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
							專為專業影像保護設計。結合離散小波轉換 (DWT) 與量化索引調變 (QIM) 技術，為您的數位資產提供不可見、高強度的版權保護。
						</p>

						<div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
							<Button size="lg" className="px-8 h-12 text-base w-full sm:w-auto transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5" asChild>
								<Link href="/embed">
									<Lock className="mr-2 h-4 w-4" />
									加密圖片
								</Link>
							</Button>
							<Button size="lg" variant="outline" className="px-8 h-12 text-base w-full sm:w-auto hover:bg-secondary/80 transition-colors" asChild>
								<Link href="/extract">
									<ScanEye className="mr-2 h-4 w-4" />
									提取浮水印
								</Link>
							</Button>
						</div>

						{/* Tech Stats */}
						<div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto border-t pt-8">
							<div className="text-center">
								<div className="text-3xl font-bold tracking-tight mb-1">&gt; 35dB</div>
								<div className="text-sm text-muted-foreground">視覺無損 (PSNR)</div>
							</div>
							<div className="text-center">
								<div className="text-3xl font-bold tracking-tight mb-1">Worker</div>
								<div className="text-sm text-muted-foreground">非同步平行運算</div>
							</div>
							<div className="text-center">
								<div className="text-3xl font-bold tracking-tight mb-1">QIM</div>
								<div className="text-sm text-muted-foreground">抗干擾量化調變</div>
							</div>
							<div className="text-center">
								<div className="text-3xl font-bold tracking-tight mb-1">Local</div>
								<div className="text-sm text-muted-foreground">本地端隱私處理</div>
							</div>
						</div>
					</div>
				</section>

				{/* Features / Actions Grid */}
				<section id="features" className="py-16 md:py-24 bg-muted/30">
					<div className="container mx-auto px-4 sm:px-6 lg:px-8">
						<div className="text-center mb-16">
							<h2 className="text-3xl font-bold tracking-tight mb-4">全方位影像保護方案</h2>
							<p className="text-muted-foreground max-w-2xl mx-auto">
								無需上傳伺服器，所有運算皆在您的瀏覽器中完成，確保資料絕對安全。
							</p>
						</div>

						<div className="grid md:grid-cols-3 gap-8">
							{/* Embed Card */}
							<Card className="bg-background border-muted hover:border-primary/50 transition-colors group">
								<CardHeader>
									<div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
										<Fingerprint className="h-6 w-6 text-primary" />
									</div>
									<CardTitle className="text-xl">浮水印嵌入</CardTitle>
									<CardDescription>Embed Watermark</CardDescription>
								</CardHeader>
								<CardContent>
									<p className="text-muted-foreground mb-6">
										使用 DWT 頻域轉換技術，將浮水印資訊隱形嵌入圖片深層結構。抗壓縮、抗剪裁，不影響原圖視覺品質。
									</p>
									<Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all" asChild>
										<Link href="/embed">
											開始嵌入 <ArrowRight className="ml-2 h-4 w-4" />
										</Link>
									</Button>
								</CardContent>
							</Card>

							{/* Extract Card */}
							<Card className="bg-background border-muted hover:border-primary/50 transition-colors group">
								<CardHeader>
									<div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
										<ScanEye className="h-6 w-6 text-blue-600" />
									</div>
									<CardTitle className="text-xl">浮水印提取</CardTitle>
									<CardDescription>Extract & Verify</CardDescription>
								</CardHeader>
								<CardContent>
									<p className="text-muted-foreground mb-6">
										透過盲檢測算法 (Blind Detection)，無需原圖即可精準還原嵌入的浮水印資訊，驗證圖片版權歸屬。
									</p>
									<Button variant="outline" className="w-full group-hover:bg-blue-600 group-hover:text-white transition-all" asChild>
										<Link href="/extract">
											開始提取 <ArrowRight className="ml-2 h-4 w-4" />
										</Link>
									</Button>
								</CardContent>
							</Card>

							{/* Test Card */}
							<Card className="bg-background border-muted hover:border-primary/50 transition-colors group">
								<CardHeader>
									<div className="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
										<Activity className="h-6 w-6 text-amber-600" />
									</div>
									<CardTitle className="text-xl">強韌度測試</CardTitle>
									<CardDescription>Robustness Test</CardDescription>
								</CardHeader>
								<CardContent>
									<p className="text-muted-foreground mb-6">
										模擬 JPEG 壓縮、噪聲干擾、縮放等攻擊場 scenarios，測試浮水印的存活率與強韌程度 (Robustness)。
									</p>
									<Button variant="outline" className="w-full group-hover:bg-amber-600 group-hover:text-white transition-all" asChild>
										<Link href="/test">
											進行測試 <ArrowRight className="ml-2 h-4 w-4" />
										</Link>
									</Button>
								</CardContent>
							</Card>
						</div>
					</div>
				</section>

				{/* Technology Deep Dive */}
				<section id="technology" className="py-16 md:py-24">
					<div className="container mx-auto px-4 sm:px-6 lg:px-8">
						<div className="grid lg:grid-cols-2 gap-16 items-center">
							<div>
								<Badge variant="outline" className="mb-4">Core Architecture</Badge>
								<h2 className="text-3xl font-bold tracking-tight mb-6">
									DWT + QIM:
									<br />
									<span className="text-primary">頻域隱寫術的黃金組合</span>
								</h2>
								<div className="space-y-8">
									<div className="flex gap-4">
										<div className="mt-1 bg-primary/10 p-2 rounded-lg h-10 w-10 flex items-center justify-center shrink-0">
											<Layers className="h-5 w-5 text-primary" />
										</div>
										<div>
											<h3 className="font-semibold text-lg mb-2">Discrete Wavelet Transform (DWT)</h3>
											<p className="text-muted-foreground leading-relaxed">
												將影像分解為不同頻率的子帶 (LL, LH, HL, HH)。我們選擇在中頻帶嵌入資訊，完美平衡了不可見性與強韌性。
											</p>
										</div>
									</div>

									<div className="flex gap-4">
										<div className="mt-1 bg-primary/10 p-2 rounded-lg h-10 w-10 flex items-center justify-center shrink-0">
											<Cpu className="h-5 w-5 text-primary" />
										</div>
										<div>
											<h3 className="font-semibold text-lg mb-2">Quantization Index Modulation (QIM)</h3>
											<p className="text-muted-foreground leading-relaxed">
												透過量化步長 (Step Size) 調變小波係數。相比傳統 LSB 方法，QIM 對抗干擾的能力更強，且實現了盲提取 (Blind Extraction)。
											</p>
										</div>
									</div>

									<div className="flex gap-4">
										<div className="mt-1 bg-primary/10 p-2 rounded-lg h-10 w-10 flex items-center justify-center shrink-0">
											<Zap className="h-5 w-5 text-primary" />
										</div>
										<div>
											<h3 className="font-semibold text-lg mb-2">WebAssembly Acceleration</h3>
											<p className="text-muted-foreground leading-relaxed">
												核心演算法針對瀏覽器環境優化，利用現代瀏覽器的硬體加速能力，實現毫秒級的處理效能。
											</p>
										</div>
									</div>
								</div>
							</div>

							<div className="relative">
								<div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-3xl blur-2xl opacity-50" />
								<Card className="relative bg-background/50 border-primary/20 backdrop-blur-sm overflow-hidden">
									<div className="p-8 space-y-6">
										<div className="flex justify-between items-center border-b pb-4">
											<div className="font-mono text-sm text-primary">algorithm_status.json</div>
											<div className="flex gap-1.5">
												<div className="h-3 w-3 rounded-full bg-red-400" />
												<div className="h-3 w-3 rounded-full bg-amber-400" />
												<div className="h-3 w-3 rounded-full bg-green-400" />
											</div>
										</div>
										<div className="font-mono text-sm space-y-2 text-muted-foreground">
											<div className="flex justify-between">
												<span>Transform_Method:</span>
												<span className="text-foreground">"Haar-Wavelet"</span>
											</div>
											<div className="flex justify-between">
												<span>Decomposition_Level:</span>
												<span className="text-foreground">3</span>
											</div>
											<div className="flex justify-between">
												<span>Quantization_Step:</span>
												<span className="text-foreground">30.0</span>
											</div>
											<div className="pt-4 mt-4 border-t border-dashed">
												<div className="flex items-center gap-2 text-green-600">
													<CheckCircle className="h-4 w-4" />
													<span>Initialization Complete</span>
												</div>
											</div>
										</div>
									</div>
								</Card>
							</div>
						</div>
					</div>
				</section>

				{/* Use Cases / Workflow */}
				<section id="how-it-works" className="py-16 bg-muted/30">
					<div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
						<h2 className="text-3xl font-bold mb-12">簡單三步驟，完成保護</h2>
						<div className="grid md:grid-cols-3 gap-8 relative">
							{/* Connector Line (Desktop) */}
							<div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent -z-10" />

							<div className="flex flex-col items-center">
								<div className="h-24 w-24 bg-background rounded-full border-4 border-muted flex items-center justify-center mb-6 z-10 relative">
									<FileImage className="h-10 w-10 text-muted-foreground" />
									<div className="absolute -top-2 -right-2 bg-primary text-primary-foreground h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm">1</div>
								</div>
								<h3 className="font-bold text-xl mb-2">選擇圖片</h3>
								<p className="text-muted-foreground text-sm max-w-xs">支援 PNG, JPG 格式。所有處理均在本地端完成。</p>
							</div>

							<div className="flex flex-col items-center">
								<div className="h-24 w-24 bg-background rounded-full border-4 border-primary/20 flex items-center justify-center mb-6 z-10 relative shadow-[0_0_20px_rgba(59,130,246,0.2)]">
									<Lock className="h-10 w-10 text-primary" />
									<div className="absolute -top-2 -right-2 bg-primary text-primary-foreground h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm">2</div>
								</div>
								<h3 className="font-bold text-xl mb-2">輸入浮水印</h3>
								<p className="text-muted-foreground text-sm max-w-xs">輸入文字或版權訊息。系統將自動進行頻域嵌入運算。</p>
							</div>

							<div className="flex flex-col items-center">
								<div className="h-24 w-24 bg-background rounded-full border-4 border-muted flex items-center justify-center mb-6 z-10 relative">
									<FileCheck className="h-10 w-10 text-muted-foreground" />
									<div className="absolute -top-2 -right-2 bg-primary text-primary-foreground h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm">3</div>
								</div>
								<h3 className="font-bold text-xl mb-2">下載加密圖片</h3>
								<p className="text-muted-foreground text-sm max-w-xs">獲取肉眼無法分辨差異的浮水印圖片，隨時可進行提取驗證。</p>
							</div>
						</div>
					</div>
				</section>

				{/* CTA Section */}
				<section className="py-20">
					<div className="container mx-auto px-4 sm:px-6 lg:px-8">
						<div className="bg-primary text-primary-foreground rounded-3xl p-8 md:p-16 text-center max-w-5xl mx-auto shadow-2xl relative overflow-hidden">
							<div className="absolute top-0 left-0 p-12 opacity-10">
								<Shield className="h-64 w-64 -rotate-12" />
							</div>
							<div className="absolute bottom-0 right-0 p-12 opacity-10">
								<Lock className="h-64 w-64 rotate-12" />
							</div>

							<div className="relative z-10">
								<h2 className="text-3xl md:text-5xl font-bold mb-6">準備好保護您的作品了嗎？</h2>
								<p className="text-primary-foreground/80 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
									立即體驗次世代的隱形浮水印技術，完全免費，無需註冊。
								</p>
								<Button size="lg" variant="secondary" className="px-12 h-14 text-lg font-semibold shadow-lg hover:shadow-xl transition-all" asChild>
									<Link href="/embed">
										立即開始使用
									</Link>
								</Button>
							</div>
						</div>
					</div>
				</section>
			</main>
		</div>
	);
}
