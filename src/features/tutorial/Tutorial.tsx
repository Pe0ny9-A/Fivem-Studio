import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Circle, ArrowRight, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/utils/cn'

interface TutorialStep {
  id: string
  title: string
  description: string
  content: string
  route?: string
  action?: string
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: '欢迎使用 FiveM Studio',
    description: '开始你的 FiveM 开发之旅',
    content: 'FiveM Studio 是一个功能强大的 FiveM 资源开发工具集，帮助你更高效地开发 FiveM 资源。',
  },
  {
    id: 'editor',
    title: '代码编辑器',
    description: '强大的 Monaco 编辑器',
    content: '使用 Monaco 编辑器编写 Lua 和 JavaScript 代码，支持语法高亮、自动补全和代码片段。',
    route: '/editor',
    action: '打开编辑器',
  },
  {
    id: 'snippets',
    title: '代码片段',
    description: '快速插入常用代码',
    content: '使用代码片段库快速插入常用的 FiveM API 调用，提高开发效率。在编辑器中按 Ctrl+Space 触发。',
    route: '/editor',
    action: '查看代码片段',
  },
  {
    id: 'generator',
    title: '配置生成器',
    description: '快速生成 fxmanifest.lua',
    content: '使用配置生成器可视化创建 fxmanifest.lua 文件，无需手动编写配置。',
    route: '/generator',
    action: '打开生成器',
  },
  {
    id: 'analyzer',
    title: '依赖分析器',
    description: '分析资源依赖关系',
    content: '使用依赖分析器查看资源之间的依赖关系，检测循环依赖问题。',
    route: '/analyzer',
    action: '打开分析器',
  },
  {
    id: 'tools',
    title: '开发工具',
    description: '实用的开发工具集',
    content: '使用工具集进行 JSON 格式化、颜色转换、文本处理等操作。',
    route: '/tools',
    action: '打开工具集',
  },
  {
    id: 'shortcuts',
    title: '快捷键',
    description: '提高工作效率',
    content: '使用快捷键快速操作：Ctrl+P 搜索文件，Ctrl+K 打开命令面板。',
    route: '/shortcuts',
    action: '查看快捷键',
  },
  {
    id: 'complete',
    title: '完成！',
    description: '开始使用 FiveM Studio',
    content: '你已经了解了 FiveM Studio 的主要功能。现在可以开始创建你的第一个 FiveM 资源了！',
  },
]

export default function Tutorial() {
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set())
  const navigate = useNavigate()

  const currentStepData = tutorialSteps[currentStep]
  const isLastStep = currentStep === tutorialSteps.length - 1
  const isFirstStep = currentStep === 0

  const handleNext = () => {
    if (!isLastStep) {
      setCurrentStep(prev => prev + 1)
      setCompletedSteps(prev => new Set(prev).add(tutorialSteps[currentStep].id))
    }
  }

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSkip = () => {
    navigate('/')
  }

  const handleAction = () => {
    if (currentStepData.route) {
      navigate(currentStepData.route)
    }
  }

  const handleComplete = () => {
    setCompletedSteps(prev => new Set(prev).add(tutorialSteps[currentStep].id))
    navigate('/')
  }

  return (
    <div className="h-full overflow-auto p-6 bg-background">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">新手教程</h2>
            <p className="text-muted-foreground">
              步骤 {currentStep + 1} / {tutorialSteps.length}
            </p>
          </div>
          <Button variant="outline" onClick={handleSkip}>
            跳过教程
          </Button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {tutorialSteps.map((step, index) => (
            <button
              key={step.id}
              onClick={() => setCurrentStep(index)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors min-w-fit",
                index === currentStep
                  ? "border-primary bg-primary/10"
                  : completedSteps.has(step.id)
                  ? "border-green-500 bg-green-500/10"
                  : "border-border hover:border-primary/50"
              )}
            >
              {completedSteps.has(step.id) ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <Circle className="h-4 w-4" />
              )}
              <span className="text-sm font-medium">{step.title}</span>
            </button>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{currentStepData.title}</CardTitle>
            <CardDescription>{currentStepData.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="prose prose-sm max-w-none">
              <p>{currentStepData.content}</p>
            </div>

            {currentStepData.route && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">
                  想要尝试这个功能？
                </p>
                <Button onClick={handleAction} variant="outline">
                  {currentStepData.action}
                </Button>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={isFirstStep}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                上一步
              </Button>

              {isLastStep ? (
                <Button onClick={handleComplete}>
                  完成教程
                </Button>
              ) : (
                <Button onClick={handleNext}>
                  下一步
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

