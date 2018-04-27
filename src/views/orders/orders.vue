<template>
  <Card>
    <Tabs>
      <TabPane label="新工单" icon="clipboard">
          <new-order></new-order>
      </TabPane>
      <TabPane label="已回复" icon="compose">
          <Reply></Reply>
      </TabPane>
      <TabPane label="已派发" icon="android-walk">
          <Repairing></Repairing>
      </TabPane>
      <TabPane label="已完工" icon="settings">
          <Repaired></Repaired>
      </TabPane>
      <TabPane label="已驳回" icon="refresh">
          <Dismissed></Dismissed>
      </TabPane>
      <TabPane label="申诉中" icon="flag">
          <Appealing></Appealing>
      </TabPane>
    </Tabs>
  </Card>
</template>

<script>
  import NewOrder from './new-order';
  import Reply from './reply';
  import Repairing from './repairing';
  import Repaired from './repaired';
  import Dismissed from './dismissed';
  import Appealing from './appealing';

  export default {
      name: 'orders_index',
      components: {
          NewOrder,
          Reply,
          Repairing,
          Repaired,
          Dismissed,
          Appealing
      }
  };
</script>

<style>
  
</style>
