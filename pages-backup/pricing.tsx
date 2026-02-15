/**
 * 定价档位页面
 * 展示基础免费版 + ABC三个档次的收费方案
 */

import { Metadata } from 'next';
import PricingTiers from '@/components/pricing/PricingTiers';
import { PricingTier } from '@/lib/services/pricing-tier-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  Zap,
  Crown,
  Shield,
  Star,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';

export const metadata: Metadata = {
  title: '定价档位 - REITs智能助手',
  description: '选择适合您的数据分析档位，从免费版到企业版，满足不同需求',
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-950 dark:via-blue-950 dark:to-purple-950">
      {/* 头部横幅 */}
      <div className="bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              选择适合您的数据分析档位
            </h1>
            <p className="text-lg md:text-xl opacity-90 mb-8">
              从基础免费版到企业级方案，满足不同阶段的业务需求
            </p>
            <div className="flex justify-center gap-4 flex-wrap">
              <Badge className="bg-white/20 text-white px-4 py-2 text-sm">
                <CheckCircle2 className="w-4 h-4 mr-1" />
                30天无理由退款
              </Badge>
              <Badge className="bg-white/20 text-white px-4 py-2 text-sm">
                <Zap className="w-4 h-4 mr-1" />
                实时数据更新
              </Badge>
              <Badge className="bg-white/20 text-white px-4 py-2 text-sm">
                <Shield className="w-4 h-4 mr-1" />
                数据安全保障
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* 优势说明 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <Card className="border-0 shadow-lg bg-white/50 dark:bg-gray-900/50 backdrop-blur">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                <Star className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">零成本起步</h3>
              <p className="text-sm text-muted-foreground">
                基础功能永久免费，使用OpenStreetMap和官方统计数据，无需任何费用即可开始使用
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/50 dark:bg-gray-900/50 backdrop-blur">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">灵活升级</h3>
              <p className="text-sm text-muted-foreground">
                随时升级或降级，按需付费，年付享受17%折扣，支持月付和年付两种方式
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/50 dark:bg-gray-900/50 backdrop-blur">
            <CardContent className="p-6">
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4">
                <Crown className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">企业级服务</h3>
              <p className="text-sm text-muted-foreground">
                企业版提供专属客户经理、定制化开发、无限次分析和7x24小时技术支持
              </p>
            </CardContent>
          </Card>
        </div>

        {/* 定价档位 */}
        <PricingTiers
          currentTier={PricingTier.FREE}
          onSelectTier={(tier) => {
            console.log('Selected tier:', tier);
            // TODO: 跳转到支付页面
          }}
          yearly={false}
          onToggleYearly={(yearly) => {
            console.log('Yearly:', yearly);
          }}
        />

        {/* 常见问题 */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-8">
            常见问题
          </h2>
          
          <div className="max-w-3xl mx-auto space-y-4">
            <FAQ
              question="免费版真的永久免费吗？"
              answer="是的，基础免费版完全免费，无时间限制。您可以永久使用OpenStreetMap和国家统计局的公开数据进行地理位置分析。"
            />
            
            <FAQ
              question="年付有什么优惠？"
              answer="年付享受17%折扣，相当于只需要支付10个月的费用即可享受全年服务。例如专业版月付¥999，年付¥9,990，节省¥1,998。"
            />
            
            <FAQ
              question="可以随时升级或降级吗？"
              answer="可以。您可以随时在账户设置中升级或降级。升级后立即生效，降级在当前计费周期结束后生效。降级后已付费金额不退还。"
            />
            
            <FAQ
              question="运营商数据真的来自三大运营商吗？"
              answer="是的。专业版和企业版使用的数据直接来自中国联通、中国移动、中国电信的官方大数据平台，数据真实可靠。"
            />
            
            <FAQ
              question="企业版可以定制开发吗？"
              answer="可以。企业版提供定制化开发服务，包括专属数据接口、自定义分析模型、私有化部署等。请联系我们的销售团队了解详情。"
            />
            
            <FAQ
              question="如何获得30天无理由退款？"
              answer="购买付费档位后30天内，如果对服务不满意，可以申请全额退款。只需联系客服说明原因，我们会在3个工作日内处理退款。"
            />
          </div>
        </div>

        {/* 联系我们 */}
        <div className="mt-16 text-center">
          <Card className="max-w-2xl mx-auto border-0 shadow-xl bg-gradient-to-br from-[#667eea]/10 to-[#764ba2]/10">
            <CardContent className="p-8">
              <HelpCircle className="w-12 h-12 text-[#667eea] mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">还有疑问？</h3>
              <p className="text-muted-foreground mb-6">
                我们的专业团队随时为您解答任何问题
              </p>
              <div className="flex justify-center gap-4">
                <Button variant="outline" size="lg">
                  联系客服
                </Button>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-[#667eea] to-[#764ba2]"
                >
                  预约演示
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

/**
 * 常见问题组件
 */
function FAQ({ question, answer }: { question: string; answer: string }) {
  return (
    <Card className="border border-gray-200 dark:border-gray-800">
      <CardContent className="p-6">
        <h3 className="font-semibold mb-2 flex items-start gap-2">
          <HelpCircle className="w-5 h-5 text-[#667eea] flex-shrink-0 mt-0.5" />
          {question}
        </h3>
        <p className="text-sm text-muted-foreground ml-7">{answer}</p>
      </CardContent>
    </Card>
  );
}
