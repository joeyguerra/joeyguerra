
import { Page } from 'juphjacs/src/domain/pages/Page.mjs'

class MissionsPage extends Page {
    constructor (pagesFolder, filePath, template, delegate) {
        super(pagesFolder, filePath, template, delegate)
        this.title = 'Missions – Kaizen Ops Weblog'
        this.layout = './pages/layouts/blog.html'
        this.canonical = 'https://joeyguerra.com/missions/'
        this.excerpt = 'Active missions and long-lived projects in systems thinking and software engineering.'
        this.published = new Date('2025-11-30T03:24:00Z')
        this.uri = '/missions/index.html'
        this.tags = ['missions', 'projects', 'juphjacs', 'field ops', 'hubot data plane', 'system', 'kaizen ops']
        this.missions = [
            {
                id: 'juphjacs',
                title: 'Build the Juphjacs Web Framework',
                status: 'active',
                progress: 70,
                description: 'Exploring a different way to build web applications: small, composable, and closer to how we actually think.',
                started: '2024-01-15',
                category: 'Framework Development',
                objectives: [
                    'Create minimal, composable web framework',
                    'Enable server-side and client-side rendering',
                    'Build developer-friendly tooling',
                    'Document patterns and best practices'
                ],
                link: '/missions/juphjacs.html'
            },
            {
                id: 'hubot-data-plane',
                title: 'Hubot Data Plane',
                status: 'active',
                progress: 10,
                description: 'Building a data orchestration layer for distributed systems that need reliable state management.',
                started: '2025-09-12',
                category: 'Distributed Systems',
                objectives: [
                    'Design event-driven architecture',
                    'Implement idempotent message handlers',
                    'Build monitoring and observability',
                    'Create migration tooling'
                ],
                link: '/missions/hubot-data-plane.html'
            },
            {
                id: 'interface-playbook',
                title: 'Interface Design Playbook',
                status: 'background',
                progress: 5,
                description: 'Patterns and anti-patterns for designing system interfaces that reduce integration pain.',
                started: '2024-03-10',
                category: 'Systems Design',
                objectives: [
                    'Document interface failure modes',
                    'Create contract design templates',
                    'Build versioning strategies',
                    'Develop testing frameworks'
                ],
                link: '/missions/interface-playbook.html'
            }
        ]
    }
}

export default async (pagesFolder, filePath, template, delegate) => {
    return new MissionsPage(pagesFolder, filePath, template, delegate)
}
