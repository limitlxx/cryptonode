"use client"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function FAQ() {
  const faqs = [
    {
      question: "What is a crypto node?",
      answer:
        "A crypto node is a device that connects to a blockchain network to validate transactions and provide services. Our nodes are pre-configured to earn passive income through RPC access and staking on Solana and Gnosis networks.",
    },
    {
      question: "Do I need technical knowledge?",
      answer:
        "Nope! Our nodes come pre-configured and ready to use. Just plug in power and internet, and follow our simple guide to start earning.",
    },
    {
      question: "How much can I realistically earn?",
      answer:
        "Basic nodes typically earn $5-$20 per day, while Pro and Enterprise nodes can earn $15-$100+ per day. We provide guides to help maximize your earnings on both Solana and Gnosis networks.",
    },
    {
      question: "Tell me about the free power bank offer",
      answer:
        "Every node purchase comes with a FREE Oraimo 50,000mAh power bank that can keep your node running during power outages. This ensures continuous earnings even when the power goes out. The power bank is high-quality, durable, and specifically designed to work with our crypto nodes.",
    },
    {
      question: "What cryptocurrencies do your nodes support?",
      answer:
        "Our nodes currently support Solana, Gnosis, and XRP networks. We're constantly adding more profitable blockchain networks.",
    },
    {
      question: "Is there a warranty?",
      answer:
        "Yes! All nodes come with a 30-day warranty against hardware defects and a 14-day satisfaction guarantee.",
    },
    {
      question: "How do I get paid?",
      answer:
        "Earnings are paid directly to your crypto wallet. We provide easy instructions to set up and connect your wallet.",
    },
  ]

  return (
    <section className="py-12 px-4 bg-white">
      <div className="container mx-auto max-w-3xl">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-[#00B3E3] to-[#6B46C1]">
          FAQ
        </h2>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border-gray-200">
              <AccordionTrigger className="text-left text-base font-medium hover:text-[#00B3E3] transition-colors text-gray-900">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 text-sm">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            More questions? <span className="text-[#00B3E3] hover:underline cursor-pointer">
              
              DM us</span> anytime.
          </p>
        </div> */}
      </div>
    </section>
  )
}

