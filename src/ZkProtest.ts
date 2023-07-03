import {
  Field,
  SmartContract,
  state,
  State,
  method,
  MerkleWitness,
  Struct,
  Poseidon,
} from 'snarkyjs';

export const treeHeight = 4;
export class MerkleWitness4 extends MerkleWitness(treeHeight) {}

export class User extends Struct({
  username: Field,
}) {}

export class ZkProtest extends SmartContract {
  @state(Field) numAttendees = State<Field>();
  @state(Field) treeRoot = State<Field>();

  @method initState(initialRoot: Field) {
    this.treeRoot.set(initialRoot);
    this.numAttendees.set(Field(0));
  }

  @method joinProtest(user: User, salt: Field, path: MerkleWitness4) {
    // get the tree root
    const treeRoot = this.treeRoot.getAndAssertEquals();

    // check to see whether the user is already in the Merkle tree
    const userRoot = path.calculateRoot(
      Poseidon.hash([User.toFields(user)[0], salt])
    );
    userRoot.assertNotEquals(treeRoot, 'User is already part of the protest');

    // include user in the protest
    const newUserRoot = path.calculateRoot(
      Poseidon.hash([User.toFields(user)[0], salt])
    );
    this.treeRoot.set(newUserRoot);

    // increment numAttendees
    this.numAttendees.set(this.numAttendees.getAndAssertEquals().add(1));
  }

  @method getCount() {
    return this.numAttendees.getAndAssertEquals();
  }
}
