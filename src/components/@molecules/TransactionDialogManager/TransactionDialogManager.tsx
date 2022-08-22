/* eslint-disable default-case */
/* eslint-disable no-param-reassign */
import { transactions } from '@app/transaction-flow/transaction'
import { Dialog } from '@ensdomains/thorin'
import { useQueryClient } from '@tanstack/react-query'
import { Dispatch, useCallback, useMemo } from 'react'
import { DataInputComponents } from '../../../transaction-flow/input'
import {
  InternalTransactionFlow,
  InternalTransactionFlowItem,
  TransactionFlowAction,
} from '../../../transaction-flow/types'
import { IntroStageModal } from './stage/Intro'
import { TransactionStageModal } from './stage/TransactionStageModal'

export const TransactionDialogManager = ({
  state,
  dispatch,
  selectedFlowItem,
}: {
  state: InternalTransactionFlow
  dispatch: Dispatch<TransactionFlowAction>
  selectedFlowItem: InternalTransactionFlowItem | null
}) => {
  const queryClient = useQueryClient()

  const onDismiss = useCallback(() => {
    dispatch({
      name: 'stopFlow',
    })
  }, [dispatch])

  const InnerComponent = useMemo(() => {
    if (state.selectedKey && selectedFlowItem) {
      if (selectedFlowItem.input && selectedFlowItem.currentFlowStage === 'input') {
        console.log('selectedFlowItem: ', selectedFlowItem)
        const Component = DataInputComponents[selectedFlowItem.input.name]
        console.log('DataInputComponents: ', DataInputComponents.EditResolver)
        console.log('DataInputComponents: ', <DataInputComponents.EditResolver />)
        return (
          <DataInputComponents.EditResolver
            {...{ data: selectedFlowItem.input.data, dispatch, onDismiss }}
          />
        )
      }

      if (selectedFlowItem.intro && selectedFlowItem.currentFlowStage === 'intro') {
        return (
          <IntroStageModal
            currentStep={selectedFlowItem.currentTransaction}
            onSuccess={() => dispatch({ name: 'setFlowStage', payload: 'transaction' })}
            {...{
              ...selectedFlowItem.intro,
              onDismiss,
              transactions: selectedFlowItem.transactions,
            }}
          />
        )
      }

      const transactionItem = selectedFlowItem.transactions[selectedFlowItem.currentTransaction]
      const transaction = transactions[transactionItem.name]

      return <div>hi there</div>

      return (
        <TransactionStageModal
          actionName={transactionItem.name}
          displayItems={transaction?.displayItems(transactionItem.data)}
          currentStep={selectedFlowItem.currentTransaction}
          stepCount={selectedFlowItem.transactions.length}
          transaction={transactionItem}
          txKey={state.selectedKey}
          onDismiss={transaction.onDismiss ? transaction.onDismiss(dispatch) : onDismiss}
          onComplete={() => dispatch({ name: 'setTransactionComplete' })}
          onSuccess={() => {
            dispatch({ name: 'incrementTransaction' })
            queryClient.invalidateQueries()
          }}
          dismissBtnLabel={transaction.dismissBtnLabel}
        />
      )
    }
    return null
  }, [state.selectedKey, selectedFlowItem, onDismiss, dispatch, queryClient])

  return (
    <Dialog variant="blank" open={!!state.selectedKey} onDismiss={onDismiss}>
      {InnerComponent}
    </Dialog>
  )
}
