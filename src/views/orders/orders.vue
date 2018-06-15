<style>
    .ivu-tabs-nav-scroll {
        display: flex;
    }

    .ivu-tabs-nav {
        margin: auto;
    }
</style>
<template>
  <Card>
      <Tabs>
          <TabPane label="新工单" icon="clipboard">
              <new-order></new-order>
          </TabPane>
          <TabPane label="已派工" icon="android-walk">
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
          <TabPane label="已评价" icon="star">
              <Assessed></Assessed>
          </TabPane>
      </Tabs>
  </Card>
</template>

<script>
  import NewOrder from './new-order';
  import Repairing from './repairing';
  import Repaired from './repaired';
  import Dismissed from './dismissed';
  import Appealing from './appealing';
  import Assessed from './assessed';

  export default {
      name: 'orders_index',
      components: {
          NewOrder,
          Repairing,
          Repaired,
          Dismissed,
          Appealing,
          Assessed
      }
  };
</script>

<style>
  
</style>
