# Everybody wants a flexible system

A short story.

<figure>
    <img class="full-width" src="../../imgs/head-of-it.webp" alt="A woman software development manager standing in front of a team of developers working on their laptops, looking puzzled, while a consultant points to a screen displaying the blueprint of an inflexible warehouse management system." />
</figure>

<blockquote cite="https://thedesigngesture.com/flexibility-in-architecture-a-design-strategy/">
In architecture, flexibility refers to the ability of a structure or area to be modified in a reasonable manner, allowing a [system] to evolve over the long run as the user needs change to accommodate market shifts and extend the project's life. Architecture that struggles to adapt to change runs the risk of becoming stagnant.
<a href="https://thedesigngesture.com/flexibility-in-architecture-a-design-strategy/">The Design Gesture</a>
</blockquote>

At LogiFlex Solutions, a popular third-party logistics (3PL) company, Anna Stewart, the head of IT, faced a challenge. Despite implementing new software to optimize their warehouse and distribution centers, they struggled with declining efficiency. Sales and logistics teams blamed IT for the inflexible systems. To tackle the problem, Anna brought in a consultant, Julie Morgan, to uncover the root cause.

Julie had one observation:

<blockquote>Your systems are inflexible. If you can't adapt to change, you risk stagnating. Rigid systems are at risk of stagnation. They can't pivot, limiting their competitive edge in rapidly changing markets.</blockquote>

Julie soon uncovered the issues plaguing LogiFlex's distribution centers. The off-the-shelf software weren't designed for LogiFlex's business model and operations. The IT team tried to customize them for their workflows, but it placed a burden on the warehouse staff to keep up. With the current market changes, their processes using the system were too slow to adapt. Something had to change.

<blockquote>The problem is the rigidity of your systems,</blockquote>

Julie told Anna.

<blockquote>If you keep running like this, you'll lose your competitive edge.</blockquote>

<img class="full-width" src="../../imgs/concerned-distribution-center.webp" alt="A distribution center with rows of inventory and a large screen displaying rigid, outdated warehouse management software, while the IT head and consultant look concerned." />

<blockquote>Inflexibility hampers ROI. When systems can't adapt, businesses struggle with obsolete tech and processes.</blockquote>

A crucial customer order came in, requesting expedited product pulls over the course of the next few weeks. However, due to the inflexible processes in their warehouse software, the order couldn't be fulfilled on time, leading to a significant loss in revenue for the customer.

<blockquote>Our systems just weren't built for this,</blockquote>

lamented Anna.

<blockquote>We need to make changes.</blockquote>

<img class="full-width" src="../../imgs/dissapointed-it-head.webp" alt="A disappointed IT head on the phone with a client, while the software development team and consultant look at standard, unfulfilled orders displayed on the screen." />

<blockquote>A flexible system maximizes ROI, ensuring it can accommodate market shifts and thrive as the landscape changes.</blockquote>

Julie outlined a new vision for LogiFlex's software development team.

<blockquote>To thrive, you need flexibility in your warehouse management system. Let's adopt a modular approach, reduce batch processing, and design workflows that handle changing customer requirements.</blockquote>

By restructuring the software architecture into smaller, adaptable modules, LogiFlex could better handle varying workflows and product customization.

<img class="full-width" src="../../imgs/reimagining-warehouse.webp" alt="A software development team reimagining their warehouse management system architecture on a large whiteboard, with modular and adaptable cells while the IT head and consultant review the new flexible setup." />

<blockquote>To future-proof, start modular: design systems that can evolve to meet new requirements and maximize business value.</blockquote>

Anna and Julie immediately set about implementing changes. With the following principles to guide them:

- Modular Architecture: Reorganized the warehouse management system into flexible modules that could easily switch between workflows.
- Small Batch Processing: Introduced a pull-based software architecture that minimized delays and improved responsiveness.
- Cross-Training: Provided staff with cross-functional training to handle different software modules as demand fluctuated.

Julie noted: 

<blockquote>
These principles are pretty common. But most implementations still result in rigid systems. With the business ending up right back where they started.
</blockquote>


<blockquote>
The trick is to apply <a href="https://www.bls.gov/careeroutlook/2020/youre-a-what/human-factors-engineer.htm" title="Human Factors Engineering Description">Human Factors Engineernig</a> discipline to <b>how</b> we apply those principles.
</blockquote>

They started by taking a small team of software developers to do a [Gemba](https://en.wikipedia.org/wiki/Gemba) walk at one of LogiFlex's high traffic distribution centers. Their first goal was to find 1 person and make their job, and hence their life, easier. With Julie's [Human Factors Engineering](https://www.bls.gov/careeroutlook/2020/youre-a-what/human-factors-engineer.htm) discipline, she coached the team to ask probing questions as they shadowed people.

George, the intake manager, showed them what he had to do when a truck shipment first arrives. He explained that the problem starts when a customer calls for him to pull product, they don't always want the exact quantity that's on the skids. So in order to optimize the space in the warehouse, he has to enter into the system each quantity of product he receives so that when he pulls it, he can adjust it piece by piece. This is simple enough for a few skids, but when he gets more than 10 skids of product, it can take a while to enter each one by pieces into the system. The team picked this part of the process to start optimizing.

They built a custom app that enables him to scan in the Bill of Lading and fills out the form for him. All he has to do now is review and submit it into the system.

They continued this process, identifying bottleknecks in the whole system where they could apply technology to optimize; deliverying small solutions to small problems every week. This started to add up to big gains throughout the whole process.

<img class="full-width" src="../../imgs/training-session.webp" alt="A training session showing software developers learning to operate different modular systems while the consultant leads the training." />

<blockquote>Ready to adapt to tomorrow's challenges? Build systems that can evolve and stay ahead in an ever-changing world.</blockquote>

Three months later, the changes transformed LogiFlex's software development process.

Order fulfillment times were down by 30%, and the company could now handle customer customization efficiently. Profits were up, and Anna was proud of their newfound flexibility.

<blockquote>Let's continue to build on this success,</blockquote>

Anna encouraged her team.

<blockquote>By staying adaptable, we'll remain competitive in any market!</blockquote>

<script server>
    export default {
        layout: './layouts/post.html',
        image: '',
        title: 'Everybody wants a flexible system',
        excerpt: 'A system that is easy to change over time. Maximize ROI. Be responsive. Competitive. Adapt to a changing environment.',
        shouldPublish: true,
        published: new Date('2024-05-06T11:52:00.000Z'),
        tags: ['architecture', 'software', 'flexible'],
        image: '/imgs/head-of-it.webp',
        uri: '/blog/2024/flexible-architecture.html'
    }
</script>