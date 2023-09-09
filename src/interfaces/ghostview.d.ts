interface GhostView 
{
    ghost: string,
    viewers: string[]
}

interface GhostPackage
{
    ghostViews: GhostView[];
    ghostItems: Image[];
}

interface Viewers
{
    ids: string[];
}