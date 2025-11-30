
import { Page } from 'juphjacs/src/domain/pages/Page.mjs'

class JuphjacsMissionPage extends Page {
    constructor (pagesFolder, filePath, template, delegate) {
        super(pagesFolder, filePath, template, delegate)
        this.title = 'Mission: Build the Juphjacs Web Framework – Kaizen Ops'
        this.layout = './pages/layouts/blog.html'
        this.canonical = 'https://joeyguerra.com/missions/juphjacs.html'
        this.excerpt = 'Building a minimal, composable web framework that works the way developers actually think.'
        this.published = new Date('2024-01-15T03:24:00Z')
        this.uri = '/missions/juphjacs.html'
        this.tags = ['juphjacs', 'web framework', 'mission', 'composable', 'minimalism', 'developer experience']
        
        this.mission = {
            id: 'juphjacs',
            title: 'Build the Juphjacs Web Framework',
            status: 'active',
            progress: 70,
            started: '2024-01-15',
            category: 'Framework Development',
            description: 'Exploring a different way to build web applications: small, composable, and closer to how we actually think.',
            
            problem: {
                statement: 'Modern web frameworks are powerful but often feel disconnected from how developers naturally think about building applications. They come with steep learning curves, opinionated architectures, and tight coupling that makes incremental adoption difficult.',
                painPoints: [
                    'High cognitive overhead from framework-specific concepts',
                    'Difficult to understand what\'s happening under the hood',
                    'Hard to adopt incrementally in existing projects',
                    'Too much magic, not enough clarity'
                ]
            },
            
            vision: 'A web framework that feels like writing vanilla JavaScript with just enough structure to keep things organized. Something you can understand in an afternoon and adopt one piece at a time.',
            
            principles: [
                'Minimize abstraction layers between your code and the platform',
                'Make the framework transparent—you should see what it\'s doing',
                'Enable incremental adoption—use what you need, when you need it',
                'Prioritize developer clarity over framework cleverness'
            ],
            
            objectives: [
                {
                    title: 'Build a minimal routing system',
                    status: 'completed',
                    description: 'File-based routing with no magic—just map URLs to files.'
                },
                {
                    title: 'Create composable page components',
                    status: 'completed',
                    description: 'Simple Page class that handles rendering, layout, and metadata.'
                },
                {
                    title: 'Support both SSR and client-side rendering',
                    status: 'in-progress',
                    description: 'Render pages on the server, hydrate on the client when needed.'
                },
                {
                    title: 'Develop plugin architecture',
                    status: 'in-progress',
                    description: 'Simple lifecycle hooks for extending functionality without framework lock-in.'
                },
                {
                    title: 'Document patterns and best practices',
                    status: 'not-started',
                    description: 'Real examples, reasoning behind decisions, and migration guides.'
                },
                {
                    title: 'Build developer tooling',
                    status: 'not-started',
                    description: 'Hot reload, error reporting, and debugging helpers.'
                }
            ],
            
            updates: [
                {
                    date: '2025-11-15',
                    title: 'Plugin lifecycle hooks working',
                    summary: 'Implemented beforeRender, afterRender, and request hooks. BlogPlugin now cleanly extends base functionality.',
                    type: 'milestone'
                },
                {
                    date: '2025-10-20',
                    title: 'Page class stabilized',
                    summary: 'Settled on a pattern: Page constructor takes template and context, render method handles layout composition.',
                    type: 'milestone'
                },
                {
                    date: '2025-09-08',
                    title: 'Initial routing implementation',
                    summary: 'File-based routing working. Load .mjs files as page handlers, serve .html as templates.',
                    type: 'milestone'
                },
                {
                    date: '2025-08-12',
                    title: 'Project kickoff',
                    summary: 'Started exploring what a minimal framework would look like. Initial experiments with template rendering.',
                    type: 'update'
                }
            ],
            
            relatedPosts: [
                {
                    title: 'Why I\'m Building Another Web Framework',
                    link: '/posts/why-juphjacs',
                    date: '2025-09-01',
                    excerpt: 'The reasoning behind starting this project and what I hope to learn.'
                },
                {
                    title: 'File-Based Routing Without the Magic',
                    link: '/posts/file-based-routing',
                    date: '2025-10-15',
                    excerpt: 'How Juphjacs maps URLs to files with zero configuration.'
                }
            ]
        }
    }
}

export default async (pagesFolder, filePath, template, delegate) => {
    return new JuphjacsMissionPage(pagesFolder, filePath, template, delegate)
}
