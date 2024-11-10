# Embracing Flow-Based Work: A Path to Greater Flexibility and Efficiency

<figure>
    <img class="full-width" src="imgs/flow-vs-batch-based-work.webp" alt="AI generated image of a girl carrying a basket, wearing a backpack, dressed in a monks long dress, walking down a curing path." />
</figure>

In software development, the common approach often involves large batches of work, where teams are heads down for months and new features or changes have to wait in line. This approach can lead to long lead times (the duration between when an idea is conceived and when it's delivered), significant delays, and a constant need for re-prioritization, often involving time consuming discussions with stakeholders. Ever heard someone say they want to "get in the flow"? There's a way of working to do just that, which is more flexible and more efficient than the common approach.

# The Power of Flow-Based Work

Flow-based work focuses on breaking down tasks into small, manageable pieces that can be completed (all the way into production) incrementally. This approach allows teams to continuously deliver value, remain adaptable, and quickly respond to new requests or issues as they arise. [Jonathan Keith](ttps://www.linkedin.com/in/jonathanrkeith/ "Jonathan's LinkedIn Profile") described, "it's about having a team ready to start on anything at any time, without the bottlenecks that typically come with large batch processes".

Imagine a scenario where a request is made for a small feature change, such as modifying the verbiage on a web page. In many teams, this request might be slotted into the next quarter's work, or it might require a big conversation with executives to rescope and reprioritize existing commitments. But with a flow-based team, the response is different:

> We can start tomorrow if you're ready. If not, let us know when you'll be ready, and we will be too.

This shift in mindset not only reduces friction but also accelerates the lead time.

# Small Batches [of work] vs. Large Batches: The Impact on Throughput

The concept of small batches versus large batches can be likened to manufacturing processes, where the flow of work through a system is optimized by minimizing the size of the batches. Small batches enable improved flow through the system, while large batches decrease throughput. This principle applies equally to software development; where a batch is a group of items from the backlog.

In a flow-based system, teams are not bogged down by the need to complete large chunks of work before moving on to the next task. Instead, they can focus on small, incremental improvements that keep the momentum going. [Logan Cannon](https://www.linkedin.com/in/logandell/ "Logan's LinkedIn Profile") emphasizes the importance of eliminating time-consuming steps to maintain the flow, as any process that takes too long or has a high setup cost can disrupt the entire system.

# Balancing Flow and Batch Processes

While flow-based work offers significant advantages, it's important to recognize that some elements of batch processing may still be necessary, particularly in contexts where external constraints exist. [Kijana Woodard](https://www.linkedin.com/in/kijanawoodard/ "Kijana's LinkedIn Profile") shares an insightful perspective on this, reflecting on a potential client who sells on Amazon. In this case, the shipping process is inherently batched, as Amazon picks up orders once a day. The key is to find a balance between flow and batch processes, ensuring that each is used where it's most effective.

For example, preparing the environment for automated tests ahead of time can be seen as a batch process that supports flow-based development. By setting up certain resources in advance, the team can maintain a steady flow of work without interruptions.

# The Benefits of Combining Flow and Small Batches

One of the most compelling aspects of combining flow-based work with small batches is the ability to make fast adjustments to the process. As [Jonathan Keith](ttps://www.linkedin.com/in/jonathanrkeith/ "Jonathan's LinkedIn Profile") highlights, this approach allows teams to quickly respond to bottlenecks and adapt to new challenges without disrupting the overall workflow.

In practice, this means that even when a team completes a product feature before the marketing team is ready, they can use feature flags to launch the feature without causing disruptions. This level of flexibility ensures that the team remains productive and that valuable features are delivered to users as soon as possible.

# Conclusion

Embracing flow-based work and small batches is a powerful strategy for improving efficiency and flexibility in software development. By reducing lead times, eliminating bottlenecks, and balancing flow with necessary batch processes, teams can create a more responsive and adaptable environment. This approach not only benefits the development team but also aligns with the broader goals of the business, enabling faster delivery of valuable features and a more seamless experience for stakeholders.

This article is based on a conversation we had on our Discord server. The reader will not that the journey towards flow-based work is ongoing, with continuous learning and adaptation. But the results — faster delivery, fewer disruptions, and a more agile team — are well worth the effort.

<script server>
    export default {
        layout: './layouts/post.html',
        image: '',
        title: 'Flow vs Batch Based Work in Software Development',
        excerpt: 'In the world of software development, the traditional approach often involves large batches of work, where teams are booked up for months and new features or changes have to wait in line. This approach can lead to long lead times, significant delays, and a constant need for re-prioritization, often involving lengthy discussions with stakeholders.',
        shouldPublish: true,
        published: new Date('2024-08-12T13:50:00.000Z'),
        tags: ['agile', 'lean', 'tps', 'toyota production system', 'software', 'flexible'],
        image: '/imgs/flow-vs-batch-based-work.webp',
        uri: '/blog/2024/flow-vs-batch-based-work.html'
    }
</script>