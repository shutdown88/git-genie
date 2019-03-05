/* eslint-disable no-console */
const { Branch, Repository, Reference } = require('nodegit');
const path = require('path');

const getLocalBranchesNames = repo =>
    repo
        .getReferences(Reference.TYPE.LISTALL)
        .then(references =>
            Promise.all(
                references
                    .filter(ref => !ref.isRemote() && ref.isBranch())
                    .map(ref => Branch.name(ref))
            )
        );

const getLocalFeatureBranchesNames = repo =>
    getLocalBranchesNames(repo).then(names =>
        names.filter(name => name.startsWith('feature/'))
    );

const rebaseLocalFeatureBranches = repo =>
    getLocalFeatureBranchesNames(repo).then(names =>
        names.reduce(
            (p, name) => p.then(() => rebaseOntoDevelop(repo, name)),
            Promise.resolve()
        )
    );

const rebaseOntoDevelop = (repo, branchName) =>
    repo.rebaseBranches(branchName, 'develop').then((/* oid */) => {
        // console.log(oid);
        console.log(`${branchName} rebase finished`);
    });

const absolutePath = path.resolve(process.argv[2]);

if (!absolutePath) {
    return;
}

Repository.open(absolutePath)
    .then(rebaseLocalFeatureBranches)
    .then(() => {
        console.log('All done.');
    })
    .catch(err => {
        console.error(err);
    });
