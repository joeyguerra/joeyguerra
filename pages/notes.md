---
title: 'Notes'
layout: './pages/layouts/index.html'
canonical: 'https://joeyguerra.com/notes.html'
excerpt: 'Notes'
published: '2024-09-01'
uri: '/notes.html'
tags: ['notes']
---
# My Notes of Daily Lessons in Software Engineering

## Nomad

Docker wasn't showing up in the Driver status. Only java,qemu,raw_exec was listed.

The problem is that on Mac, Docker Desktop doesn't create the /var/run/docker.sock file because it's running in a VM. It tries to create a symlink, but it must have failed when trying on my mac mini. The solution is to create a sym link to the docker.sock file located in the users ~/.docker folder.

```sh
sudo ln -s -f /Users/<user>/.docker/run/docker.sock /var/run/docker.sock
```

## DotNet

Output generated SQL from Entity Framework to the console.

```sh
dotnet add [project_file.csproj] package Microsoft.Extensions.Logging.Console
```

```csharp
public static readonly ILoggerFactory MyLoggerFactory = LoggerFactory.Create(builder => {builder.AddConsole();});
...
services.AddDbContext<ContextName>(o => {
    o.UseSqlServer(connection, options => options.EnableRetryOnFailure())
        .UseLoggerFactory(MyLoggerFactory);    
})
...
```

### DB Context is null when being injected into a Repository class

Fields in appsettings.json must have a correspdoning property in AppSettings.cs in order to be available in code.

### Unit Testing Entity Framework connected to SQL Server

```csharp
var configurationBuilder = new ConfigurationBuilder()
    .SetBasePath(AppDomain.CurrentDOmain.BaseDirectory)
    .AddJsonFile($"appSettings.json", optional: false, reloadOnChange: false)
    .AddEnvironmentVariables().Build();
var services = new ServiceCollection()
    .Configure<AppSettings>(configurationBuilder)
    .AddSingleton(resolver => resolver.GetRequiredService<IOptions<AppSettings>>().Value)

services.AddTransient<IContextRepo, ContextRepo>()
services.AddDbContext<Context>(o => {
    o.UseSqlServer(contextInstance);
});
```

From the Unit Test, get the service by calling a method on the fixture after everything has started up.

```csharp
public T GetService<T>(){
    return _provider.GetServices<T>().FirstOrDefault();
}
```

## Elasticsearch

If you want to change/map how property names get serialized to Elasticsearch document, use [DataMember(Name="")] from System.Runtime.Serialization

## SQL

```sql
select * from sys.columns c
inner join sys.tables t on c.object_id = t.object_id
where c.name like '%%'
```

## Redis

Create a replica. Copy PROD data to QA.

```sh
REPLICAOF host port
```

## Javascript

[Tagged Templates](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals)

## Website Marketing

- Setup Google Analytics
- Google Search - https://search.google.com/ Verify domain with DNS TXT record
- Optimize page speed with https://developers.google.com/speed/pagespeed/insights

## Multiple Gitlab Accounts

```sh
# ~/.gitconfig             
# This is Git's per-user configuration file.
[user]
# Please adapt and uncomment the following lines:
    name = Joey Guerra
    email = {email address}
[pull]
    rebase = false
[init]
    defaultBranch = main

[includeIf "gitdir/i:~/src/{project folder for code}/"]
    path = ~/src/{project folder for code}/.gitconfig
```

## e2e integration tests with Gitlab pipeline

```yaml
integration:
  image: mcr.microsoft.com/playwright:focal
  services:
    - redis
  variables:
    APP_NAME: PdfGenerator
  script:
    - curl https://packages.microsoft.com/config/ubuntu/20.04/packages-microsoft-prod.deb --output packages-microsoft-prod.deb
    - dpkg -i packages-microsoft-prod.deb
    - rm packages-microsoft-prod.deb
    - apt-get update
    - apt-get install -y apt-transport-https
    - apt-get install -y dotnet-sdk-5.0
    - cd $APP_NAME.Tests
    - pwd
    - dotnet build
    - dotnet tool install --global Microsoft.Playwright.CLI
    - export PATH="$PATH:/root/.dotnet/tools"
    - playwright install
    - cd ../
    - make integration
  artifacts:
    name: '$CI_JOB_NAME_$CI_COMMIT_REF_NAME'
    paths:
      - $APP_NAME.Tests/IntegrationTests_*.xml
```

## Kubernetes

```sh
kubectl create secret generic {name of secret} -n {namespace name} --dry-run=client --from-literal {key}={password} --from-literal {key}={password} --from-literal {key}={password} -o yaml | kubeseal --format yaml | tee sealed-secret.yaml
```

